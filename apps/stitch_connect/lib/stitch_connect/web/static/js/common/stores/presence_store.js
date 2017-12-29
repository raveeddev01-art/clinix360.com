import { Presence } from "phoenix";
import { action, autorun, computed, observable } from "mobx";
import Cookies from "js-cookie";
import moment from "moment";
import debounce from "lodash/debounce";
import throttle from "lodash/throttle";

import {
  PRESENCE_DEBOUNCE_WAIT,
  USER_INTERACTION_THROTTLE
} from "lib/constants";

class PresenceStore {
  @observable teamId = "";
  @observable onlineUsersMap = {};
  @observable locked = window.locked;
  @observable unlocking = false; // Flag that indicates if unlocking request is being made

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

  @action
  debouncedUpdatePresence = debounce(
    this.updatePresence,
    PRESENCE_DEBOUNCE_WAIT
  );

  @action
  throttledUserInteract = throttle(
    this.onUserInteract,
    USER_INTERACTION_THROTTLE
  );

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

      this.locked = true;
      this.teamChannel.push("locked");
      this.teamChannel.push("became_inactive");
      this.teamChannel.push("became_away");
      this.rootStore.channelStore.leaveAllChannelsButTeam();
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

  onUserInteract = () => {
    if (this.locked) return;
    window.clearTimeout(this.lockoutTimerID);
    this.startLockoutTimer();

    window.clearTimeout(this.awayTimerID);
    this.awayTimerID = window.setTimeout(
      this.onAwayTimerExpired,
      30 * 60 * 1000
    );

    this.teamChannel.push("became_active");

    if (this.lockoutSettingLoaded) {
      Cookies.set("last_activity", new Date().toString(), { expires: 30 }); // expires in 30 days
    }
  };

  onAwayTimerExpired = () => {
    this.teamChannel.push("became_away");
  };

  onLockoutTimerExpired = () => {
    this.teamChannel.push("lockout_timer_expired");
    this.lock();
  };

  getLockoutSettings = () => {
    this.teamChannel
      .push("get_lockout_settings")
      .receive("ok", this.onLockoutSettingsLoaded);
  };

  @action
  onLockoutSettingsLoaded = data => {
    const lastActivity = Cookies.get("last_activity");
    this.secondsToLockout = data.seconds_to_lockout;
    this.lockoutEnabled = data.security_lockout_enabled;
    this.lockoutSettingLoaded = true;

    if (
      lastActivity &&
      moment().diff(lastActivity, "seconds") > data.seconds_to_lockout
    ) {
      // user came back after lockout limit time
      this.lock();
    } else {
      this.startLockoutTimer();
    }
  };

  startLockoutTimer = () => {
    if (!this.lockoutSettingLoaded) {
      this.getLockoutSettings();
    } else if (this.lockoutEnabled) {
      clearTimeout(this.lockoutTimerID);
      this.lockoutTimerID = setTimeout(
        this.onLockoutTimerExpired,
        this.secondsToLockout * 1000
      );
    }
  };
}

export default PresenceStore;
