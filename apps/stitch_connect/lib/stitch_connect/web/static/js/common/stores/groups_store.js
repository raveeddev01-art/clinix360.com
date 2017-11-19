/**
 * Groups store
 * 
 * This store keeps track of groups of the app.
 */

import { observable, computed, action } from "mobx";
import orderBy from "lodash/orderBy";

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
    return this.groups.filter(group => group.favorite);
  }

  @computed
  get normalGroups() {
    return this.groups.filter(
      group => group.type === "regular" && !group.favorite
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
  loadGroups = () => {
    const { sidemenuStore } = this.rootStore;

    return get("/api/v1/groups").then(response => {
      this.groups = orderBy(response.data, ["name"]);
      sidemenuStore.updateFavicon();
    });
  };

  @action
  hideGroup = id => {
    return put(`/api/v1/groups/${id}/hide`);
  };

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
  onNewGroup = newGroup => {
    this.groups.push(newGroup);
  };

  @action
  onRenameGroup = params => {
    const data = {
      slug: params.group_slug,
      name: params.group_name
    };

    this.updateGroupData(params.group_id, data);

    if (this.rootStore.groupStore.id === params.group_id) {
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
