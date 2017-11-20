/**
 * Groups store
 * 
 * This store keeps track of groups of the app.
 */

import { observable, computed, action } from "mobx";
import orderBy from "lodash/orderBy";

import { getGroupUrl } from "lib/utils";

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
  updateGroupCursor = (groupId, cursor) => {
    this.groupCursors[groupId] = cursor;
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
  createGroup = params => {
    return post("/api/v1/groups", {
      body: params
    }).then(resp => {
      const { data } = resp;

      return data.slug;
    });
  };

  @action createSingleDMGroup = () => {};
  @action createMultiDMGroup = () => {};

  @action
  openGroup = slug => {
    const group = this.getGroupBySlug(slug);

    if (group && group.id !== this.currentGroupId) {
      this.currentGroupId = group.id;
      this.onOpenedGroup();
    }
  };

  @action openSingleDMGroup = () => {};
  @action openMultiDMGroup = () => {};

  @action
  hideGroup = groupId => {
    return put(`/api/v1/groups/${groupId}/hide`);
  };

  @action
  joinGroup = groupId => {
    return post(`/api/v1/groups/${groupId}/join`).then(() => {
      this.updateGroupData(groupId, {
        joined: true
      });
    });
  };

  @action
  leaveGroup = groupId => {
    return post(`/api/v1/groups/${groupId}/leave`).then(resp => {
      this.updateGroupData(groupId, {
        joined: false
      });

      return resp.data.redirect_to;
    });
  };

  @action
  renameGroup = (groupId, name) => {
    return patch(`/api/v1/groups/${groupId}/rename`, {
      body: { name }
    });
  };

  @action
  inviteUsersToGroup = (groupId, userIds) => {
    return post(`/api/v1/groups/${groupId}/invite`, {
      body: {
        user_ids: userIds
      }
    });
  };

  @action
  setPublicOfGroup = (groupId, value) => {
    return post(`/api/v1/groups/${groupId}/toggle-public`, {
      body: { public: value }
    }).then(() => {
      this.updateGroupData(groupId, { public: value });
    });
  };

  @action
  toggleFavorite = groupId => {
    return post(
      `/api/v1/groups/${groupId}/toggle-favorite`
    ).then(({ is_favorite }) => {
      this.updateGroupData(groupId, { is_favorite });
    });
  };

  /* Event handlers */

  @action
  onOpenedGroup = () => {
    const {
      messageStore,
      pinnedMessageStore,
      groupPresenceStore
    } = this.rootStore;

    messageStore.reset();
    messageStore.joinGroupChannel();

    pinnedMessageStore.reset();
    groupPresenceStore.subscribeToGroupChannel();
  };

  @action
  onCreatedGroup = group => {
    this.groups.push(group);
  };

  @action
  onRenamedGroup = params => {
    const data = {
      slug: params.group_slug,
      name: params.group_name
    };

    this.updateGroupData(params.group_id, data);

    if (this.rootStore.groupStore.group.id === params.group_id) {
      history.push(`/rooms/${params.group_slug}`);
    }
  };

  @action
  onJoinedGroup = joinedGroup => {
    const group = this.getGroupById(joinedGroup.id);

    if (group) {
      group.joined = true;
    }
  };

  @action
  onLeftGroup = ({ group_id: groupId }) => {
    const group = this.getGroupById(groupId);

    if (group) {
      group.joined = false;
    }
  };
}

export default GroupsStore;
