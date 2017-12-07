import { Presence } from "phoenix";
import { observable, computed } from "mobx";

class GroupPresenceStore {
  @observable usersCurrentlyInGroup = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get typingUsers() {
    return Object.keys(this.usersCurrentlyInGroup)
      .filter(id => this.usersCurrentlyInGroup[id].metas[0].is_typing)
      .filter(id => id !== window.currentUser.id.toString());
  }

  // ////////////// //
  // EVENT HANDLERS //
  // ////////////// //

  onPresenceState = state => {
    this.usersCurrentlyInGroup = Presence.syncState(
      this.usersCurrentlyInGroup,
      state
    );
  };

  onPresenceDiff = diff => {
    this.usersCurrentlyInGroup = Presence.syncDiff(
      this.usersCurrentlyInGroup,
      diff
    );
  };
}

export default GroupPresenceStore;
