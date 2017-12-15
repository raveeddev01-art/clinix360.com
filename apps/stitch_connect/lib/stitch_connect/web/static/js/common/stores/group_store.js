/**
 * Group store
 *
 * This store keeps track of data of of the group that current user is in now.
 */

import { observable, computed, action } from "mobx";

class GroupStore {
  @observable showAllUsers = true;

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
  setPublic = value => {
    const { groupsStore } = this.rootStore;

    return groupsStore.setPublicOfGroup(this.group.id, value);
  };

  @action
  toggleFavorite = () => {
    const { groupsStore } = this.rootStore;

    return groupsStore.toggleFavorite(this.group.id);
  };

  @action
  toggleAllUsers = () => {
    this.showAllUsers = !this.showAllUsers;
  };
}

export default GroupStore;
