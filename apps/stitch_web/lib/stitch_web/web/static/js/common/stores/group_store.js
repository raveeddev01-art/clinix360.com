/**
 * Group store
 *
 * This store keeps track of data of of the group that current user is in now.
 */

import { observable, computed, action } from "mobx";
import { TYPING_TIMEOUT_MS } from "lib/constants";

class GroupStore {
  @observable typingUsers = []; // user id array
  typingTimeouts = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get group() {
    const { groupsStore } = this.rootStore;

    return groupsStore.currentGroup || groupsStore.defaultGroup;
  }

  @computed
  get onlineUsers() {
    const { presenceStore } = this.rootStore;

    return this.group.users.filter(user =>
      presenceStore.isOnline(`${user.id}`)
    );
  }

  @computed
  get isSelfDM() {
    return this.group.type === "dm" && this.group.users.length === 1;
  }

  @computed
  get groupName() {
    const { groupsStore } = this.rootStore;
    return groupsStore.getGroupName(this.group);
  }

  @computed
  get isLastMember() {
    return this.group.users.length === 1;
  }

  // =============
  // Actions
  // =============

  @action
  reset = () => {
    this.typingUsers = [];
    Object.keys(this.typingTimeouts).forEach(key => {
      clearTimeout(this.typingTimeouts[key]);
    });
  };

  @action
  onStartedTyping = args => {
    const { user_id: userId, group_id: groupId } = args;
    if (userId === currentUser.id || groupId !== this.group.id) {
      return;
    }

    // insert typing user into list if he is not in the list yet
    if (!this.typingUsers.includes(userId)) {
      this.typingUsers.push(userId);
    }

    // clear timeout and restart
    if (this.typingTimeouts[userId]) {
      clearTimeout(this.typingTimeouts[userId]);
    }

    this.typingTimeouts[userId] = setTimeout(
      () => this.stoppedTyping(userId),
      TYPING_TIMEOUT_MS
    );
  };

  @action
  stoppedTyping = userID => {
    this.typingUsers = this.typingUsers.filter(u => u !== userID);
  };

  @action
  hide = () => {
    const { groupsStore } = this.rootStore;

    return groupsStore.hideGroup(this.group.id);
  };

  @action
  join = () => {
    const { groupsStore } = this.rootStore;

    return groupsStore.joinGroup(this.group.id);
  };

  @action
  leave = () => {
    const { groupsStore } = this.rootStore;

    return groupsStore.leaveGroup(this.group.id);
  };

  @action
  rename = name => {
    const { groupsStore } = this.rootStore;

    return groupsStore.renameGroup(this.group.id, name);
  };

  @action
  inviteUsers = userIds => {
    const { groupsStore } = this.rootStore;

    return groupsStore.inviteUsersToGroup(this.group.id, userIds);
  };

  @action
  removeUsers = userIds => {
    const { groupsStore } = this.rootStore;

    return groupsStore.removeUsersFromGroup(this.group.id, userIds);
  };

  @action
  setPublic = value => {
    const { groupsStore } = this.rootStore;

    return groupsStore.setPublicOfGroup(this.group.id, value);
  };

  @action
  toggleFavorite = () => {
    const { groupsStore } = this.rootStore;

    return groupsStore.toggleFavorite(this.group.id);
  };
}

export default GroupStore;
