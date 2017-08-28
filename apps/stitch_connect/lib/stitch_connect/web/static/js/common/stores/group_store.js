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
  @observable favorite = false;
  @observable notificationSetting = null;
  @observable showAllUsers = true;
  @observable groupType = "group"; // group, single-dm, multi-dm
  @observable dmUsers = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get channelTopic() {
    return `groups:${this.slug}`;
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
  createGroup = params => {
    return post("/api/v1/groups", {
      body: params
    }).then(resp => {
      const { data } = resp;
      return data.slug;
    });
  };

  @action
  loadGroupBySlug = slug => {
    if (slug === this.slug) {
      return;
    }

    this.loading = true;
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
      this.users = data.users;
      this.unreadMessagesCount = data.unread_messages_count;
    });
  };

  @action
  joinSingleDM = user => {
    const userIds = [currentUser.id, user.id].sort((a, b) => a > b);
    const slug = `__dm:${userIds.join(".")}`;

    this.loading = true;
    get(`/api/v1/groups?slug=${slug}`).then(resp => {
      this.loading = false;

      const { data } = resp;

      this.id = data.id;
      this.slug = data.slug;
      this.name = user.first_name; // data.name;
      this.description = data.description;
      this.public = data.public;
      this.favorite = !!data.favorite;
      this.joined = data.joined;
      this.groupType = "single-dm";
      this.users = data.users;
      this.unreadMessagesCount = data.unread_messages_count;
    });
  };

  @action
  joinMultiDM = users => {
    let userIds = users.map(user => user.id);
    if (userIds.indexOf(currentUser.id) === -1) {
      userIds.push(currentUser.id);
    }

    userIds = userIds.sort((a, b) => a > b);
    this.loading = true;
    return post(`/api/v1/groups/multi-dm`, {
      body: { user_ids: userIds }
    }).then(resp => {
      this.loading = false;

      const { data } = resp;

      this.id = data.id;
      this.slug = data.slug;
      this.users = data.users;
      this.name = data.users.map(user => user.first_name).join(", ");
      this.description = data.description;
      this.public = data.public;
      this.favorite = !!data.favorite;
      this.joined = data.joined;
      this.groupType = "multi-dm";
      this.unreadMessagesCount = data.unread_messages_count;
    });
  };

  @action
  togglePublic = value => {
    return post(`/api/v1/groups/${this.id}/toggle-public`, {
      body: { public: value }
    }).then(resp => {
      this.public = !this.public;
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
    }).then(resp => {
      notify.show("Group name has been changed successfully");
    });
  };

  @action
  saveUsers = members => {
    return post(`/api/v1/groups/${this.id}/invite`, {
      body: {
        user_ids: _.map(members, "id").join(",")
      }
    }).then(resp => {
      notify.show("Users invited to group");
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
    return post(`/api/v1/groups/${this.id}/join`).then(resp => {
      this.joined = true;
      notify.show("User has joined the group");
    });
  };

  @action
  leave = () => {
    return post(`/api/v1/groups/${this.id}/leave`).then(resp => {
      this.joined = false;
      notify.show("User has been removed from the group");
    });
  };

  @action
  loadNotificationSetting = () => {
    return get(
      `/api/v1/groups/${this.id}/notification-preference`
    ).then(resp => {
      this.notificationSetting = resp.data.setting;
      return this.notificationSetting;
    });
  };

  @action
  saveNotificationSetting = setting => {
    return post(`/api/v1/groups/${this.id}/update-notification-preference`, {
      body: { setting }
    }).then(resp => {
      this.notificationSetting = setting;
      notify.show(`Notification setting saved for group ${this.name}`);
    });
  };

  @action
  increaseUnreadMessagesCount() {
    this.unreadMessagesCount += 1;
  }

  @action
  decreaseUnreadMessagesCount() {
    this.unreadMessagesCount -= 1;
  }
}

export default GroupStore;
