/**
 * Group store
 * 
 * This store keeps track of data of of the group that current user is in now.
 */

import { observable, computed, action } from "mobx";
import _ from "lodash";

class GroupStore {
  @observable loading = false;
  @observable name = "";
  @observable id = "";
  @observable slug = "";
  @observable description = "";
  @observable public = true;
  @observable joined = false;
  @observable users = [];
  @observable unreadMessagesCount = 0;
  @observable lastReadAt = null;
  @observable mentionsCount = 0;
  @observable favorite = false;
  @observable notificationSetting = null;
  @observable showAllUsers = true;
  @observable createdBy = null;
  @observable createdAt = null;
  @observable groupType = "group"; // group, single-dm, multi-dm
  @observable dmUsers = [];
  @observable isDefault = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get onlineUsers() {
    return this.users.filter(user =>
      this.rootStore.presenceStore.isOnline(`${user.id}`)
    );
  }

  @computed
  get userMap() {
    const map = {};
    this.users.forEach(user => {
      map[user.id] = user;
    });
    return map;
  }

  @action
  update(data) {
    Object.assign(this, data);
  }

  @action
  createGroup = params => {
    return post("/api/v1/groups", {
      body: params
    }).then(resp => {
      const { data } = resp;
      return data.slug;
    });
  };

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
  joinGroup = slug => {
    if (slug === this.slug) {
      return;
    }

    this.loading = true;
    // Reset message store before join
    this.rootStore.messageStore.reset();

    get(`/api/v1/groups?slug=${slug}`).then(resp => {
      this.loading = false;

      const { data } = resp;

      this.id = data.id;
      this.slug = data.slug;
      this.name = data.name;
      this.description = data.description;
      this.public = data.public;
      this.favorite = !!data.favorite;
      this.joined = data.joined;
      this.groupType = "group";
      this.isDefault = data.is_default;
      this.users = data.users;
      this.unreadMessagesCount = data.unread_messages_count;
      this.mentionsCount = data.mentions_count;
      this.lastReadAt = data.last_read_at;
      this.createdBy = data.creator_user_id;
      this.createdAt = data.inserted_at;

      this.postJoin();
    });
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
      this.groupType = "single-dm";
      this.isDefault = false;
      this.users = data.users;
      this.unreadMessagesCount = data.unread_messages_count;
      this.mentionsCount = data.mentions_count;
      this.lastReadAt = data.last_read_at;

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

    return post(`/api/v1/groups/multi-dm`, {
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
      this.groupType = "multi-dm";
      this.isDefault = false;
      this.unreadMessagesCount = data.unread_messages_count;
      this.mentionsCount = data.mentions_count;
      this.lastReadAt = data.last_read_at;

      this.postJoin();
    });
  };

  @action
  togglePublic = value => {
    return post(`/api/v1/groups/${this.id}/toggle-public`, {
      body: { public: value }
    }).then(() => {
      this.public = !this.public;
      return this;
    });
  };

  @action
  loadUsers = () => {
    return get(`/api/v1/groups/${this.id}/users`).then(resp => {
      this.users = resp.data;
      return resp.data;
    });
  };

  @action
  toggleAllUsers = () => {
    this.showAllUsers = !this.showAllUsers;
  };

  @action
  rename = groupName => {
    return patch(`/api/v1/groups/${this.id}/rename`, {
      body: { name: groupName, slug: groupName }
    }).then(resp => resp.data);
  };

  @action
  saveUsers = members => {
    return post(`/api/v1/groups/${this.id}/invite`, {
      body: {
        user_ids: _.map(members, "id").join(",")
      }
    });
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
  join = () => {
    return post(`/api/v1/groups/${this.id}/join`).then(() => {
      this.joined = true;
    });
  };

  @action
  leave = () => {
    return post(`/api/v1/groups/${this.id}/leave`).then(resp => {
      this.joined = false;
      return resp.data.redirect_to;
    });
  };

  @action
  hide = () => {
    return put(`/api/v1/groups/${this.id}/hide`);
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
