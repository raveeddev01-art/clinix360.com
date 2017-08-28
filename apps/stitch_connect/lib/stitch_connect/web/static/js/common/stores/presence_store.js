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
