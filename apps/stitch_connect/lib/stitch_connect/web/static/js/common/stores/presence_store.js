import { Presence } from "phoenix";
import { observable, action, computed } from "mobx";

class PresenceStore {
  @observable teamId = "";
  @observable onlineUsersMap = {};

  constructor(rootStore, props) {
    this.rootStore = rootStore;

    this.teamId = props.teamId;
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
    return this.everyCurrentUserSession("away_timer_expired");
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
  };

  @action
  onPresenceState = state => {
    this.onlineUsersMap = Presence.syncState(this.onlineUsersMap, state);
  };

  @action
  onPresenceDiff = diff => {
    this.onlineUsersMap = Presence.syncDiff(this.onlineUsersMap, diff);
  };

  @action
  setTeamId(id) {
    this.teamId = id;
  }
}

export default PresenceStore;
