/**
 * Users store
 * 
 * This store keeps track of users of the app
 */

import { observable, computed, action } from "mobx";

import history from "../../util/history";
import { getRoomNavLink } from "../../lib/room";

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

    // if username of the user in multi-dm or single-dm current user is on, is changed,
    // it should redirect
    const { groupStore } = this.rootStore;

    if (
      groupStore.groupType === "single-dm" ||
      groupStore.groupType === "multi-dm"
    ) {
      const changedUser = groupStore.users.find(u => u.id === user.id);
      if (changedUser.username !== user.username) {
        changedUser.username = user.username;
        history.replace(
          getRoomNavLink({
            type: groupStore.groupType === "single-dm" ? "dm" : "multi-dm",
            users: groupStore.users
          })
        );
      }
    }
  };
}

export default UsersStore;
