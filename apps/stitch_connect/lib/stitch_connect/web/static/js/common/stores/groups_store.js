/**
 * Groups store
 *
 * This store keeps track of groups of the app.
 */

import { observable, computed, action } from "mobx";
import history from "lib/history";
import orderBy from "lodash/orderBy";

import {
  getGroupUserIdsThatHasCurrentUser,
  getSlugOfDMGroupByUsers,
  getGroupUrl
} from "lib/utils";

class GroupsStore {
  @observable groups = [];
  @observable groupCursors = {}; // { group_id: message_id }, Holds the id of oldest message that is visible in chat pane in group
  @observable currentGroupId = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // //////// //
  // COMPUTED //
  // //////// //

  getGroupById = id => this.groups.find(group => group.id === id);

  getGroupBySlug = slug => this.groups.find(group => group.slug === slug);

  getGroupUrl = id => getGroupUrl(this.getGroupById(id));

  @computed
  get currentGroup() {
    if (!this.currentGroupId) {
      return null;
    }

    return this.getGroupById(this.currentGroupId);
  }

  @computed
  get defaultGroup() {
    return this.groups.find(g => g.is_default);
  }

  @computed
  get visibleGroups() {
    return this.groups.filter(g => !g.is_hidden);
  }

  @computed
  get hiddenGroups() {
    return this.groups.filter(g => g.is_hidden);
  }

  @computed
  get favoriteGroups() {
    return this.visibleGroups.filter(group => group.is_favorite);
  }

  @computed
  get normalGroups() {
    return this.visibleGroups.filter(
      group => group.type === "regular" && !group.is_favorite
    );
  }

  @computed
  get directGroups() {
    return this.visibleGroups.filter(
      group => group.type !== "regular" && !group.is_favorite
    );
  }

  @computed
  get multiDMGroups() {
    return this.visibleGroups.filter(group => group.type === "multi_dm");
  }

  @computed
  get roomsInShowOrder() {
    return this.favoriteGroups.concat(this.normalGroups, this.directGroups);
  }

  @computed
  get totalMentionsCount() {
    return this.visibleGroups.reduce((count, group) => {
      if (group.type === "regular") {
        return count + group.mentions_count;
      }

      return count + group.unread_messages_count;
    }, 0);
  }

  // //////////
  // ACTIONS //
  // /////// //

  @action
  updateGroupData = (id, data) => {
    const group = this.getGroupById(id);

    if (group) {
      Object.assign(group, data);
    }
  };

  @action
  updateGroupCursor = (id, cursor) => {
    this.groupCursors[id] = cursor;
  };

  @action
  getDMGroup = userId => {
    const users =
      userId < currentUser.id
        ? [userId, currentUser.id]
        : [currentUser.id, userId];
    return this.groups.find(g => g.slug === `__dm:${users.join(".")}`);
  };

  @action
  updateUserInAllGroups = (userId, userData) => {
    this.groups.forEach(group => {
      const user = group.users.find(u => u.id === userId);
      if (user) {
        Object.assign(user, userData);
      }
    });
  };

  @action
  loadGroups = () => {
    const { sidemenuStore } = this.rootStore;

    return get("/api/v1/groups").then(response => {
      this.groups = orderBy(response.data, ["name"]).map(group => ({
        ...group,
        new_message_line_at: null,
        marked_as_unread: false
      }));

      sidemenuStore.updateFavicon();
    });
  };

  @action
  openGroup = slug => {
    const group = this.getGroupBySlug(slug);

    if (group && group.id !== this.currentGroupId) {
      if (this.currentGroupId) {
        this.onClosedGroup();
      }

      // Change the group
      this.currentGroupId = group.id;

      this.onOpenedGroup();
    }
  };

  @action
  openDMGroup = usernames => {
    const { usersStore } = this.rootStore;
    const users = usernames.map(username =>
      usersStore.getUserByUsername(username)
    );
    const userIds = getGroupUserIdsThatHasCurrentUser(users);
    const slug = getSlugOfDMGroupByUsers(userIds);

    this.openGroup(slug);
  };

  @action
  hideGroup = id => {
    return put(`/api/v1/groups/${id}/hide`)
      .then(() => {
        this.updateGroupData(id, { is_hidden: true });
      })
      .then(() => {
        if (this.currentGroupId === id) {
          history.push(`/rooms/${this.defaultGroup.slug}`);
        }
      });
  };

  @action
  unhideGroup = id => {
    return put(`/api/v1/groups/${id}/unhide`).then(() => {
      this.updateGroupData(id, { is_hidden: false });
    });
  };

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
  createDMGroup = userIds => {
    const body = { user_ids: userIds };

    return userIds.length > 2
      ? post(`/api/v1/groups/multi_dm`, {
          body
        })
      : post(`/api/v1/groups/dm`, { body });
  };

  @action
  joinGroup = id => {
    return post(`/api/v1/groups/${id}/join`).then(() => {
      this.updateGroupData(id, { joined: true });
    });
  };

  @action
  leaveGroup = id => {
    return post(`/api/v1/groups/${id}/leave`).then(resp => {
      this.updateGroupData(id, { joined: false });

      return resp.data.redirect_to;
    });
  };

  @action
  renameGroup = (id, name) => {
    return patch(`/api/v1/groups/${id}/rename`, {
      body: { name }
    });
  };

  @action
  inviteUsersToGroup = (id, userIds) => {
    return post(`/api/v1/groups/${id}/invite`, {
      body: {
        user_ids: userIds
      }
    });
  };

  @action
  setPublicOfGroup = (id, value) => {
    return post(`/api/v1/groups/${id}/toggle-public`, {
      body: { public: value }
    }).then(() => {
      this.updateGroupData(id, { public: value });
    });
  };

  @action
  toggleFavorite = id => {
    return post(`/api/v1/groups/${id}/toggle-favorite`);
  };

  /* Event handlers */

  /**
   * Run the process of when opening the group
   */
  @action
  onOpenedGroup = () => {
    const { channelStore, messageStore, pinnedMessageStore } = this.rootStore;

    // Join group channel
    channelStore
      .joinGroupChannel()
      .receive("ok", messageStore.onJoinGroupChannel)
      .receive("error", err => notify.show(err.message, "error"));

    // Reset messages
    messageStore.reset();

    // Reset pinned messages
    pinnedMessageStore.reset();
  };

  /**
   * Run the process of when closing the group
   */
  @action
  onClosedGroup = () => {
    const { channelStore } = this.rootStore;

    channelStore.leaveGroupChannel();
    this.currentGroupId = null;
  };

  @action
  onHidGroup = ({ group_id: id, is_hidden }) => {
    this.updateGroupData(id, { is_hidden });
  };

  @action
  onCreatedGroup = group => {
    this.groups.push(group);
  };

  @action
  onJoinedGroup = ({ group_id: id }) => {
    this.updateGroupData(id, { joined: true });
  };

  @action
  onLeftGroup = ({ group_id: id }) => {
    this.updateGroupData(id, { joined: false });
  };

  @action
  onRenamedGroup = ({ group_id: id, group_slug: slug, group_name: name }) => {
    this.updateGroupData(id, { slug, name });

    if (id === this.currentGroupId) {
      history.push(`/rooms/${slug}`);
    }
  };

  @action
  onMarkedAsRead = payload => {
    const { sidemenuStore } = this.rootStore;

    this.updateGroupData(payload.group_id, {
      unread_messages_count: payload.unread_messages_count,
      mentions_count: payload.mentions_count,
      last_read_at: payload.last_read_at,
      marked_as_unread: false
    });

    // Update favicon
    sidemenuStore.updateFavicon();
  };

  @action
  onMarkedAsUnread = payload => {
    const { sidemenuStore } = this.rootStore;

    this.updateGroupData(payload.group_id, {
      unread_messages_count: payload.unread_messages_count,
      mentions_count: payload.mentions_count,
      last_read_at: payload.last_read_at,
      new_message_line_at: payload.last_read_at,
      marked_as_unread: true
    });

    // Update favicon
    sidemenuStore.updateFavicon();
  };

  @action
  onMembersUpdated = payload => {
    const allUsers = this.rootStore.usersStore.usersById;
    const users = payload.user_ids.map(id => allUsers[id]);
    this.updateGroupData(payload.group_id, {
      users
    });

    // redirect to default group if user is removed from current room
    const meRemoved = payload.user_ids.indexOf(currentUser.id) === -1;
    if (meRemoved && this.currentGroupId === payload.group_id) {
      history.push(`/rooms/${this.defaultGroup.slug}`);
    }

    // @TODO update groups without loading all groups
    // @NOTE loadGroups is called because private groups aren't existed yet in the list
    this.loadGroups();
  };

  @action
  onFavoriteChanged = payload => {
    this.updateGroupData(payload.group_id, {
      is_favorite: payload.is_favorite
    });
  };
}

export default GroupsStore;
