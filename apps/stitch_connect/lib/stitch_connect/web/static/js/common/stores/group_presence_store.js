import { Presence } from "phoenix";
import { observable, computed } from "mobx";

class GroupPresenceStore {
  @observable usersCurrentlyInGroup = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  isTyping = userId => {
    return this.usersCurrentlyInGroup[userId].metas[0].is_typing;
  };

  @computed
  get typingUsers() {
    const { presenceStore } = this.rootStore;

    return (
      Object.keys(this.usersCurrentlyInGroup)
        .filter(userId => userId !== window.currentUser.id.toString())
        // Double-check if the user is really online with team presence store
        .filter(userId => presenceStore.isOnline(userId))
        .filter(userId => this.isTyping(userId))
    );
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
