/**
 * Group store
 * 
 * This store keeps track of data of of the group that current user is in now.
 */

import { observable, computed, action } from "mobx";

class GroupStore {
  @observable notificationSetting = null;
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

  @action
  postJoin = () => {
    const {
      messageStore,
      pinnedMessageStore,
      groupPresenceStore
    } = this.rootStore;

    messageStore.joinGroupChannel();
    pinnedMessageStore.reset();
    groupPresenceStore.subscribeToGroupChannel();
  };

  @action
  joinSingleDM = user => {
    const userIds = [currentUser.id, user.id].sort((a, b) => a > b);
    const slug = `__dm:${userIds.join(".")}`;

    if (slug === this.slug) {
      return new Promise(resolve => {
        resolve();
      });
    }

    this.loading = true;
    // Reset message store before join
    this.rootStore.messageStore.reset();

    return post(`/api/v1/groups/dm`, {
      body: { user_ids: userIds }
    }).then(resp => {
      this.loading = false;

      const { data } = resp;

      this.id = data.id;
      this.slug = data.slug;
      this.name = `${user.first_name} ${user.last_name}${user.id ===
      currentUser.id
        ? " (You)"
        : ""}`;
      this.description = data.description;
      this.public = data.public;
      this.favorite = !!data.favorite;
      this.joined = data.joined;
      this.type = data.type;
      this.is_default = false;
      this.users = data.users;
      this.unread_messages_count = data.unread_messages_count;
      this.mentions_count = data.mentions_count;
      this.last_read_at = data.last_read_at;

      this.postJoin();
    });
  };

  @action
  joinMultiDM = users => {
    let userIds = users.map(user => user.id);

    if (userIds.indexOf(currentUser.id) === -1) {
      userIds.push(currentUser.id);
    }

    userIds = userIds.sort((a, b) => a > b);

    const slug = `__dm:${userIds.join(".")}`;

    if (slug === this.slug) {
      return new Promise(resolve => {
        resolve();
      });
    }

    this.loading = true;
    // Reset message store before join
    this.rootStore.messageStore.reset();

    return post(`/api/v1/groups/multi_dm`, {
      body: { user_ids: userIds }
    }).then(resp => {
      this.loading = false;

      const { data } = resp;

      this.id = data.id;
      this.slug = data.slug;
      this.users = data.users;
      this.name = data.users
        .filter(user => user.id !== currentUser.id)
        .map(user => `${user.first_name} ${user.last_name}`)
        .join(", ");
      this.description = data.description;
      this.public = data.public;
      this.favorite = !!data.favorite;
      this.joined = data.joined;
      this.type = data.type;
      this.is_default = false;
      this.unread_messages_count = data.unread_messages_count;
      this.mentions_count = data.mentions_count;
      this.last_read_at = data.last_read_at;

      this.postJoin();
    });
  };

  @action
  toggleAllUsers = () => {
    this.showAllUsers = !this.showAllUsers;
  };

  toggleFavorite = value => {
    return post(`/api/v1/groups/${this.id}/toggle-favorite`, {
      body: { favorite: value }
    }).then(() => {
      this.favorite = !this.favorite;
      return this.favorite;
    });
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
  setPublic = value => {
    const { groupsStore } = this.rootStore;

    return groupsStore.setPublicOfGroup(this.group.id, value);
  };

  @action
  loadNotificationSetting = () => {
    return get(
      `/api/v1/groups/${this.id}/notification-preference`
    ).then(resp => {
      this.notificationSetting = resp.data.desktop_notification_preference;
      return this.notificationSetting;
    });
  };

  @action
  saveNotificationSetting = setting => {
    return put(`/api/v1/groups/${this.id}/notification-preference`, {
      body: {
        desktop_notification_preference: setting
      }
    }).then(() => {
      this.notificationSetting = setting;
    });
  };
}

export default GroupStore;
