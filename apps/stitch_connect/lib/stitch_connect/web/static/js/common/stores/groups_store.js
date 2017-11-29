/**
 * Groups store
 *
 * This store keeps track of groups of the app.
 */

import { observable, computed, action } from "mobx";
import orderBy from "lodash/orderBy";

import {
  getGroupUserIdsThatHasCurrentUser,
  getSlugOfDMGroupByUsers,
  getGroupUrl
} from "lib/utils";

class GroupsStore {
  @observable groups = [];
  @observable groupCursors = {}; // { group_id: message_id }
  @observable currentGroupId = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // //////// //
  // COMPUTED //
  // //////// //

  getGroupById = id => this.groups.find(group => group.id === id);

  getGroupBySlug = slug => this.groups.find(group => group.slug === slug);

  getGroupUrl = id => {
    return getGroupUrl(this.getGroupById(id));
  };

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
  get favoriteGroups() {
    return this.groups.filter(group => group.is_favorite);
  }

  @computed
  get normalGroups() {
    return this.groups.filter(
      group => group.type === "regular" && !group.is_favorite
    );
  }

  @computed
  get directGroups() {
    return this.groups.filter(group => group.type !== "regular");
  }

  @computed
  get multiDMGroups() {
    return this.groups.filter(group => group.type === "multi_dm");
  }

  @computed
  get roomsInShowOrder() {
    return this.favoriteGroups.concat(this.normalGroups, this.directGroups);
  }

  @computed
  get totalMentionsCount() {
    return this.groups.reduce((count, group) => {
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
  loadGroups = () => {
    const { sidemenuStore } = this.rootStore;

    return get("/api/v1/groups").then(response => {
      this.groups = orderBy(response.data, ["name"]);
      sidemenuStore.updateFavicon();
    });
  };

  @action
  openGroup = slug => {
    const group = this.getGroupBySlug(slug);

    if (group && group.id !== this.currentGroupId) {
      this.currentGroupId = group.id;
      this.onOpenedGroup();
    }
  };

  @action
  openDMGroup = usernames => {
    const { usersStore } = this.rootStore;
    const users = usernames.map(username =>
      usersStore.users.find(u => u.username === username)
    );
    const userIds = getGroupUserIdsThatHasCurrentUser(users);
    const slug = getSlugOfDMGroupByUsers(userIds);

    this.openGroup(slug);
  };

  @action
  hideGroup = id => {
    return put(`/api/v1/groups/${id}/hide`).then(() => {
      this.updateGroupData(id, { is_hidden: true });
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
    return post(
      `/api/v1/groups/${id}/toggle-favorite`
    ).then(({ is_favorite }) => {
      this.updateGroupData(id, { is_favorite });
    });
  };

  /* Event handlers */

  @action
  onOpenedGroup = () => {
    const {
      channelStore,
      messageStore,
      pinnedMessageStore,
      groupPresenceStore
    } = this.rootStore;

    // Join group channel
    channelStore
      .joinGroupChannel()
      .receive("ok", messageStore.onJoinGroupChannel)
      .receive("error", err => notify.show(err.message, "error"));

    // Reset messages
    messageStore.reset();

    // Reset pinned messages
    pinnedMessageStore.reset();

    // Resubscribe to group presence store
    groupPresenceStore.subscribeToGroupChannel();
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
}

export default GroupsStore;
