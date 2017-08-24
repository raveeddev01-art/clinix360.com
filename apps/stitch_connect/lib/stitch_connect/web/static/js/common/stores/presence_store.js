import { Presence } from "phoenix";
import { observable, action, computed } from "mobx";

class PresenceStore {
  @observable teamId = "";
  @observable onlineUsersMap = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  connectPresence = id => {
    this.teamId = id;
    const lobby = socket.channel(`team:lobby:${this.teamId}`, {});

    lobby.on("presence_state", this.onPresenceState);
    lobby.on("presence_diff", this.onPresenceDiff);
    lobby.join();
  };

  @action
  onPresenceState = state => {
    this.onlineUsersMap = Presence.syncState(this.onlineUsersMap, state);
  };

  @action
  onPresenceDiff = diff => {
    this.onlineUsersMap = Presence.syncDiff(this.onlineUsersMap, diff);
  };

  isOnline(userId) {
    return !!this.onlineUsersMap[`${userId}`];
  }

  @computed
  get onlineUsers() {
    return Object.keys(this.onlineUsersMap || {}).map(
      id => this.onlineUsersMap[id].metas[0]
    );
  }
}

export default PresenceStore;
