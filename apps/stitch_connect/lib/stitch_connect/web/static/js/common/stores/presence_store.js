import { Presence } from "phoenix";
import { action, autorun, computed, observable } from "mobx";

class PresenceStore {
  @observable teamId = "";
  @observable onlineUsersMap = {};
  @observable locked = window.locked;
  @observable unlocking = false; // Flag that indicates if unlocking request is being made

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

  get teamLobbyChannelTopic() {
    return `team:lobby:${this.teamId}`;
  }

  get teamLobbyChannel() {
    return this.rootStore.channelStore.teamLobbyChannel;
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

  isOnline(userId) {
    return !!this.onlineUsersMap[`${userId}`];
  }

  joinTeamLobbyChannel = () => {
    this.rootStore.channelStore.joinTeamLobbyChannel();

    this.teamLobbyChannel.on("presence_state", this.onPresenceState);
    this.teamLobbyChannel.on("presence_diff", this.onPresenceDiff);
    this.teamLobbyChannel.on("locked", this.onLocked);
    this.teamLobbyChannel.on("unlocked", this.onUnlocked);
  };

  @action
  onPresenceState = state => {
    this.onlineUsersMap = Presence.syncState(this.onlineUsersMap, state);
  };

  @action
  onPresenceDiff = diff => {
    this.onlineUsersMap = Presence.syncDiff(this.onlineUsersMap, diff);
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
      this.teamLobbyChannel.push("locked");
      this.teamLobbyChannel.push("became_inactive");
      this.teamLobbyChannel.push("became_away");
      this.rootStore.channelStore.leaveAllChannelsButTeamLobby();
    });
  };

  @action
  unlock = pin => {
    this.unlocking = true;

    return post("/api/v1/session-unlock", { body: { pin } })
      .then(() => {
        this.teamLobbyChannel.push("unlocked");
        window.location.reload();
      })
      .catch(() => {
        this.unlocking = false;
        return Promise.reject();
      });
  };

  onWindowBlur = () => {
    if (this.locked) return;

    this.teamLobbyChannel.push("became_inactive");
    this.awayTimerID = window.setTimeout(
      this.onAwayTimerExpired,
      30 * 60 * 1000
    );
    this.startLockoutTimer();
  };

  onWindowFocus = () => {
    if (this.locked) return;
    window.clearTimeout(this.lockoutTimerID);
    window.clearTimeout(this.awayTimerID);
    this.teamLobbyChannel.push("became_active");
  };

  onAwayTimerExpired = () => {
    this.teamLobbyChannel.push("became_away");
  };

  onLockoutTimerExpired = () => {
    this.teamLobbyChannel.push("lockout_timer_expired");
    this.lock();
  };

  getLockoutSettings = (cb) => {
    this.teamLobbyChannel
      .push("get_lockout_settings")
      .receive("ok", (data) => {
        this.secondsToLockout = data.seconds_to_lockout;
        this.lockoutEnabled = data.security_lockout_enabled;
        this.lockoutSettingLoaded = true;

        if (typeof cb === 'function') cb();
      });
  }

  startLockoutTimer = () => {
    if (!this.lockoutSettingLoaded) {
      this.getLockoutSettings(this.startLockoutTimer);
    } else if (this.lockoutEnabled) {
      clearTimeout(this.lockoutTimerID);
      this.lockoutTimerID = setTimeout(
        this.onLockoutTimerExpired,
        this.secondsToLockout * 1000
      );
    }
  }
}

export default PresenceStore;
