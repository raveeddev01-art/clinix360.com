/**
 * Users store
 * 
 * This store keeps track of users of the app
 */

import { observable, computed, action } from "mobx";

import history from "../../lib/history";
import { getRoomNavLink } from "../../lib/utils";

class UsersStore {
  @observable users = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // //////// //
  // COMPUTED //
  // //////// //

  getUserById = userId => this.users.find(u => u.id === userId);

  @computed
  get usersByUsername() {
    const map = {};

    this.users.forEach(user => {
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

  // ////////////////////// //
  // Channel Event Handlers //
  // ////////////////////// //

  @action
  onUserJoined = user => {
    this.users.push(user);
  };

  @action
  onUserInfo = user => {
    const index = this.users.findIndex(u => u.id === user.id);

    this.users[index] = user;

    if (user.id === currentUser.id) {
      const { userStore } = this.rootStore;

      userStore.onUserInfo(user);
    }

    // if username of the user in multi_dm or dm current user is on, is changed,
    // it should redirect
    const { groupStore } = this.rootStore;

    if (groupStore.type === "dm" || groupStore.type === "multi_dm") {
      const changedUser = groupStore.users.find(u => u.id === user.id);
      if (changedUser.username !== user.username) {
        changedUser.username = user.username;
        history.replace(
          getRoomNavLink({
            type: groupStore.type,
            users: groupStore.users
          })
        );
      }
    }
  };
}

export default UsersStore;
