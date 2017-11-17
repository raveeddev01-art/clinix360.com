import { action } from "mobx";

class MembersStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  activateUser = userId => {
    const { sidemenuStore } = this.rootStore;

    return post(`/api/v1/users/${userId}/activate`, {
      hideNotify: true
    }).then(() => {
      const user = sidemenuStore.getUserById(userId);
      if (user) {
        user.disabled = false;
      }
    });
  };

  @action
  deactivateUser = userId => {
    const { sidemenuStore } = this.rootStore;

    return post(`/api/v1/users/${userId}/deactivate`, {
      hideNotify: true
    }).then(() => {
      const user = sidemenuStore.getUserById(userId);
      if (user) {
        user.disabled = true;
      }
    });
  };

  @action
  revokeAdmin = userId => {
    const { sidemenuStore } = this.rootStore;

    return put(`/api/v1/users/${userId}/revoke-admin`, {
      hideNotify: true
    }).then(() => {
      const user = sidemenuStore.getUserById(userId);
      if (user) {
        user.roles = ["member"];
      }
    });
  };

  @action
  promoteAdmin = userId => {
    const { sidemenuStore } = this.rootStore;

    return put(`/api/v1/users/${userId}/promote-admin`, {
      hideNotify: true
    }).then(() => {
      const user = sidemenuStore.getUserById(userId);
      if (user) {
        user.roles = ["admin"];
      }
    });
  };
}

export default MembersStore;
