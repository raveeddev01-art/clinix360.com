import { Presence } from "phoenix";
import { observable, computed, action } from "mobx";
import debounce from "lodash/debounce";

import { PRESENCE_DEBOUNCE_WAIT } from "lib/constants";

class GroupPresenceStore {
  @observable onlineUsersMap = {};

  onlineUsersMapCache = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  isTyping = userId => {
    return this.onlineUsersMap[userId].metas[0].is_typing;
  };

  @computed
  get typingUsers() {
    const { presenceStore } = this.rootStore;

    return Object.keys(this.onlineUsersMap).filter(
      userId =>
        userId !== window.currentUser.id.toString() &&
        // Double-check if the user is really online with team presence store
        presenceStore.isOnline(userId) &&
        this.isTyping(userId)
    );
  }

  // ////////////// //
  // EVENT HANDLERS //
  // ////////////// //

  @action
  updatePresence = () => {
    this.onlineUsersMap = this.onlineUsersMapCache;
  };

  @action
  debouncedUpdatePresence = debounce(
    this.updatePresence,
    PRESENCE_DEBOUNCE_WAIT
  );

  onPresenceState = state => {
    this.onlineUsersMapCache = Presence.syncState(
      this.onlineUsersMapCache,
      state
    );
  };

  onPresenceDiff = diff => {
    this.onlineUsersMapCache = Presence.syncDiff(
      this.onlineUsersMapCache,
      diff
    );
  };
}

export default GroupPresenceStore;
