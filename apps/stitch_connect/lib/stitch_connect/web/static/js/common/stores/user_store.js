import { observable, action, computed } from "mobx";

class UserStore {
  @observable id = "";
  @observable loading = false;
  @observable username = "";
  @observable phone = "";
  @observable title = "";
  @observable email = "";
  @observable firstName = "";
  @observable lastName = "";
  @observable profileImgUrl = "";
  @observable roles = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get isAdmin() {
    return this.roles.indexOf("admin") > -1;
  }

  @computed
  get canInvite() {
    return this.isAdmin || this.rootStore.teamStore.openInvitationsEnabled;
  }

  @action
  loadUser = id => {
    this.loading = true;
    this.id = id;

    get(`/api/v1/users/${id}`).then(resp => {
      const { data } = resp;
      this.username = data.username;
      this.phone = data.phone || "";
      this.title = data.title || "";
      this.email = data.email;
      this.firstName = data.first_name;
      this.lastName = data.last_name;
      this.profileImgUrl = data.avatar;
      this.roles = data.roles;

      this.loading = false;
    });
  };

  @action
  onUserInfo = user => {
    if (user.roles) {
      window.currentUser.roles = user.roles;
      this.roles = user.roles;
    }
  };

  @action
  save = data => {
    return put(`/api/v1/users/${this.id}`, {
      body: data,
      hideNotify: true
    });
  };

  @action
  saveUsername = username => {
    return this.save({ username }).then(() => {
      this.username = username;
    });
  };

  @action
  saveEmail = email => {
    return this.save({ email }).then(() => {
      this.email = email;
    });
  };

  @action
  savePIN = pin => {
    return this.save({ pin }).then(() => {
      this.pin = pin;
    });
  };

  @action
  saveName = (firstName, lastName) => {
    return this.save({
      first_name: firstName,
      last_name: lastName
    }).then(() => {
      this.firstName = firstName;
      this.lastName = lastName;
    });
  };

  @action
  savePhone = phoneNumber => {
    return this.save({ phone_number: phoneNumber }).then(() => {
      this.phone = phoneNumber;
    });
  };

  @action
  saveTitle = title => {
    return this.save({ title }).then(() => {
      this.title = title;
    });
  };

  @action
  saveProfileImg = profileImgUrl => {
    return this.save({ profile_image_url: profileImgUrl }).then(() => {
      this.profileImg = profileImgUrl;
    });
  };

  @action
  savePassword = (oldPassword, newPassword) => {
    return put(`/api/v1/users/${this.id}/update_password`, {
      body: {
        new_password: newPassword,
        old_password: oldPassword
      },
      hideNotify: true
    });
  };

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

export default UserStore;
