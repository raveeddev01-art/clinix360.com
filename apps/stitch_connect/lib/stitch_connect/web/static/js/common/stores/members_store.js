import { computed, action } from "mobx";

class MembersStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get users() {
    const { sidemenuStore } = this.rootStore;

    return sidemenuStore.users;
  }

  @computed
  get onlineUsers() {
    const { presenceStore } = this.rootStore;

    return this.users.filter(u => presenceStore.isOnline(u.id));
  }

  @computed
  get offlineUsers() {
    const { presenceStore } = this.rootStore;

    return this.users.filter(u => !presenceStore.isOnline(u.id));
  }

  @computed
  get deactivatedUsers() {
    return this.users.filter(u => u.disabled);
  }

  getUser = userId => this.users.find(u => u.id === userId);

  @action
  activateUser = userId => {
    return post(`/api/v1/users/${userId}/activate`, {
      hideNotify: true
    }).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.disabled = false;
      }
    });
  };

  @action
  deactivateUser = userId => {
    return post(`/api/v1/users/${userId}/deactivate`, {
      hideNotify: true
    }).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.disabled = true;
      }
    });
  };

  @action
  revokeAdmin = userId => {
    return put(`/api/v1/users/${userId}/revoke-admin`, {
      hideNotify: true
    }).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.roles = ["member"];
      }
    });
  };

  @action
  promoteAdmin = userId => {
    return put(`/api/v1/users/${userId}/promote-admin`, {
      hideNotify: true
    }).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.roles = ["admin"];
      }
    });
  };
}

export default MembersStore;
