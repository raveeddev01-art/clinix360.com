import { Presence } from "phoenix";
import { action, autorun, computed, observable } from "mobx";
import Cookies from "js-cookie";
import moment from "moment";
import debounce from "lodash/debounce";
import throttle from "lodash/throttle";

import {
  PRESENCE_DEBOUNCE_WAIT,
  USER_INTERACTION_THROTTLE,
  LOCKOUT_CHECK_MS,
  BECAME_AWAY_TIMEOUT_MS,
  BECAME_INACTIVE_TIMEOUT_MS
} from "lib/constants";

class PresenceStore {
  @observable teamId = "";
  @observable onlineUsersMap = {};
  @observable locked = window.locked;
  @observable unlocking = false; // Flag that indicates if unlocking request is being made
  @observable isActive = false; // indicates whether the app has focus

  onlineUsersMapCache = {};

  // lockout settings
  lockoutSettingLoaded = false;
  lockoutEnabled = false;
  secondsToLockout = null;

  constructor(rootStore, props) {
    this.rootStore = rootStore;
    this.teamId = props.teamId;

    autorun(() => {
      if (!this.locked && this.isCurrentUserSessionLockoutTimerExpired) {
        this.lock();
      }
    });
  }

  get teamChannel() {
    const { channelStore } = this.rootStore;

    return channelStore.teamChannel;
  }

  @computed
  get onlineUsers() {
    return Object.keys(this.onlineUsersMap || {}).map(
      id => this.onlineUsersMap[id].metas[0]
    );
  }

  everyCurrentUserSession(state) {
    const currenUserPresence = this.onlineUsersMap[window.currentUser.id];

    if (!currenUserPresence) return false;

    const currentUserSessionMetas = currenUserPresence.metas.filter(
      meta => meta.session_id === window.sessionId
    );

    if (!currentUserSessionMetas.length) return false;

    return currentUserSessionMetas.every(meta => meta[state]);
  }

  @computed
  get isCurrentUserSessionInactive() {
    return this.everyCurrentUserSession("inactive");
  }

  @computed
  get isCurrentUserSessionAwayTimerExpired() {
    return this.everyCurrentUserSession("became_away");
  }

  @computed
  get isCurrentUserSessionLockoutTimerExpired() {
    return this.everyCurrentUserSession("lockout_timer_expired");
  }

  isOnline = userId => {
    return !!this.onlineUsersMap[userId];
  };

  @action
  updatePresence = () => {
    this.onlineUsersMap = this.onlineUsersMapCache;
  };

  onPresenceState = state => {
    this.onlineUsersMapCache = Presence.syncState(
      this.onlineUsersMapCache,
      state
    );

    // When loading initially, update without debounce
    this.updatePresence();
  };

  onPresenceDiff = diff => {
    this.onlineUsersMapCache = Presence.syncDiff(
      this.onlineUsersMapCache,
      diff
    );

    // Debounce updating presence
    this.debouncedUpdatePresence();
  };

  onLocked = ({ sessionId }) => {
    if (sessionId === window.sessionId) this.lock();
  };

  onUnlocked = ({ sessionId }) => {
    if (sessionId === window.sessionId) window.location.reload();
  };

  onLogout = ({ session_id: sessionId }) => {
    if (window.sessionId === sessionId) {
      this.logout();
    }
  };

  @action
  fetchFocus = () => {
    this.isActive =
      typeof document.hasFocus === "function" ? document.hasFocus() : true; // hasFocus not supported in opera
  };

  @action
  setTeamId(id) {
    this.teamId = id;
  }

  @action
  lock = () => {
    if (this.locked) return;

    post("/api/v1/session-lock").then(() => {
      window.clearTimeout(this.lockoutTimerID);
      window.clearTimeout(this.awayTimerID);
      window.clearTimeout(this.inactiveTimerID);

      this.locked = true;
      this.teamChannel.push("locked");
      this.onBecameInactive();
      this.onBecameAway();
      this.rootStore.channelStore.leaveAllChannelsButTeamAndEvent();
    });
  };

  @action
  unlock = pin => {
    this.unlocking = true;
    Cookies.remove("last_activity");

    return post("/api/v1/session-unlock", { hideNotify: true, body: { pin } })
      .then(() => {
        this.teamChannel.push("unlocked");
        window.location.reload();
      })
      .catch(() => {
        this.unlocking = false;
        return Promise.reject();
      });
  };

  logout = () => {
    window.location = "/logged-out";
  };

  onUserInteract = () => {
    if (this.locked) return;

    window.clearTimeout(this.awayTimerID);
    window.clearTimeout(this.inactiveTimerID);
    this.awayTimerID = window.setTimeout(
      this.onBecameAway,
      BECAME_AWAY_TIMEOUT_MS
    );
    this.inactiveTimerID = window.setTimeout(
      this.onBecameInactive,
      BECAME_INACTIVE_TIMEOUT_MS
    );

    this.onBecameActive();

    if (this.lockoutSettingLoaded) {
      Cookies.set("last_activity", moment().format(), { expires: 30 }); // expires in 30 days
    }
  };

  onBecameInactive = () => {
    if (this.locked) return;
    this.throttledUserInteract.cancel(); // after inactive, user interact shouldn't be fired
    this.teamChannel.push("became_inactive");
  };

  onBecameActive = () => {
    if (this.locked) return;
    this.teamChannel.push("became_active");
  };

  onBecameAway = () => {
    this.teamChannel.push("became_away");
  };

  @action
  onWindowBlur = () => {
    window.clearTimeout(this.inactiveTimerID);
    this.isActive = false;
  };

  @action
  onWindowFocus = () => {
    this.isActive = true;
    document.trigger("window.focused");
  };

  checkLockoutTimerExpired = () => {
    const lastActivity = Cookies.get("last_activity");
    if (
      this.lockoutEnabled &&
      lastActivity &&
      moment().diff(lastActivity, "seconds") > this.secondsToLockout
    ) {
      // user came back after lockout limit time
      this.teamChannel.push("lockout_timer_expired");
      this.lock();
    }
  };

  getLockoutSettings = () => {
    this.teamChannel
      .push("get_lockout_settings")
      .receive("ok", this.onLockoutSettingsLoaded);
  };

  @action
  onLockoutSettingsLoaded = data => {
    this.secondsToLockout = data.seconds_to_lockout;
    this.lockoutEnabled = data.security_lockout_enabled;
    this.lockoutSettingLoaded = true;
    this.startLockoutTimer();
    this.checkLockoutTimerExpired();
    this.onUserInteract();
  };

  startLockoutTimer = () => {
    clearTimeout(this.lockoutTimerID);
    if (this.lockoutEnabled) {
      this.lockoutTimerID = setInterval(
        this.checkLockoutTimerExpired,
        LOCKOUT_CHECK_MS
      );
    }
  };

  debouncedUpdatePresence = debounce(
    this.updatePresence,
    PRESENCE_DEBOUNCE_WAIT
  );

  throttledUserInteract = throttle(
    this.onUserInteract,
    USER_INTERACTION_THROTTLE
  );
}

export default PresenceStore;
