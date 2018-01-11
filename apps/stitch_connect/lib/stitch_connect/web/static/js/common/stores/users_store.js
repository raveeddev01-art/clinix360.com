/**
 * Users store
 *
 * This store keeps track of users of the app
 */

import { observable, computed, action } from "mobx";

import history from "lib/history";

class UsersStore {
  @observable users = [];
  @observable editingUserId = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // //////// //
  // COMPUTED //
  // //////// //

  getUserById = userId => this.users.find(u => u.id === userId);
  getUserByUsername = username => this.users.find(u => u.username === username);

  @computed
  get editingUser() {
    return this.getUserById(this.editingUserId);
  }

  @computed
  get usersByUsername() {
    const map = {};

    this.activatedUsers.forEach(user => {
      map[user.username] = user;
    });

    return map;
  }

  @computed
  get usersById() {
    const map = {};

    this.users.forEach(user => {
      map[user.id] = user;
    });

    return map;
  }

  @computed
  get activatedUsers() {
    return this.users.filter(u => !u.disabled);
  }

  @computed
  get deactivatedUsers() {
    return this.users.filter(u => u.disabled);
  }

  @computed
  get onlineUsers() {
    const { presenceStore } = this.rootStore;

    return this.activatedUsers.filter(u => presenceStore.isOnline(u.id));
  }

  @computed
  get offlineUsers() {
    const { presenceStore } = this.rootStore;

    return this.activatedUsers.filter(u => !presenceStore.isOnline(u.id));
  }

  // //////////
  // ACTIONS //
  // /////// //

  @action
  loadUsers = () => {
    return get("/api/v1/users").then(response => {
      this.users = response.data;
    });
  };

  @action
  updateUserData = (id, data) => {
    const user = this.getUserById(id);

    if (user) {
      Object.assign(user, data);
    }
  };

  @action
  activateUser = userId => {
    return post(`/api/v1/users/${userId}/activate`, {
      hideNotify: true
    }).then(() => {
      this.updateUserData(userId, { disabled: false });
    });
  };

  @action
  deactivateUser = userId => {
    return post(`/api/v1/users/${userId}/deactivate`, {
      hideNotify: true
    }).then(() => {
      this.updateUserData(userId, { disabled: true });
    });
  };

  @action
  revokeAdmin = userId => {
    return put(`/api/v1/users/${userId}/revoke-admin`, {
      hideNotify: true
    }).then(() => {
      this.updateUserData(userId, { roles: ["member"] });
    });
  };

  @action
  promoteAdmin = userId => {
    return put(`/api/v1/users/${userId}/promote-admin`, {
      hideNotify: true
    }).then(() => {
      this.updateUserData(userId, { roles: ["admin"] });
    });
  };

  @action
  editUser = data => {
    return put(`/api/v1/users/${this.editingUserId}/roles`, {
      body: data
    });
  };

  // ////////////////////// //
  // Channel Event Handlers //
  // ////////////////////// //

  @action
  onStartEditing = userId => {
    this.editingUserId = userId;
  };

  @action
  onEndEditing = () => {
    this.editingUserId = null;
  };

  @action
  onUserJoined = user => {
    this.users.push(user);
  };

  @action
  onUserInfo = user => {
    const index = this.users.findIndex(u => u.id === user.id);
    const { groupsStore, groupStore } = this.rootStore;

    this.users[index] = user;
    groupsStore.updateUserInAllGroups(user.id, user);

    if (user.id === currentUser.id) {
      const { userStore } = this.rootStore;

      userStore.onUserInfo(user);
    }

    // if username of the user in multi_dm or dm current user is on, is changed,
    // it should redirect

    if (
      groupStore.group.type === "dm" ||
      groupStore.group.type === "multi_dm"
    ) {
      const changedUser = groupStore.group.users.find(u => u.id === user.id);
      if (changedUser.username !== user.username) {
        changedUser.username = user.username;
        history.replace(groupsStore.getGroupUrl(groupStore.group.id));
      }
    }
  };

  @action
  onUserDeactivated = payload => {
    const user = this.getUserById(payload.user_id);
    const { groupsStore } = this.rootStore;

    if (payload.user_id === currentUser.id) {
      window.location.href = "/logged-out";
      return;
    }

    if (user) {
      user.disabled = true;
      groupsStore.updateUserInAllGroups(payload.user_id, {
        disabled: true
      });

      const dm = groupsStore.getDMGroup(payload.user_id);
      if (dm) {
        groupsStore.hideGroup(dm.id);
      }
    }
  };

  @action
  onUserActivated = payload => {
    const user = this.getUserById(payload.user_id);
    const { groupsStore } = this.rootStore;

    if (user) {
      user.disabled = false;
      groupsStore.updateUserInAllGroups(payload.user_id, {
        disabled: false
      });
    }
  };
}

export default UsersStore;
