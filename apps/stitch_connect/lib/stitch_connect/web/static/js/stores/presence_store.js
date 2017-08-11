import { Presence } from "phoenix";
import { observable, action } from "mobx";

class PresenceStore {
  @observable teamId = "";
  @observable onlineUsersMap = {};

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
}

const store = new PresenceStore();
export default store;
