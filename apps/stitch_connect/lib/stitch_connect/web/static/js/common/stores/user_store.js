/**
 * User store
 *
 * This store keeps track of data of current logged in user
 */

import { observable, action, computed } from "mobx";
import pick from "lodash/pick";

class UserStore {
  @observable id = "";
  @observable loading = false;
  @observable username = "";
  @observable phone = "";
  @observable title = "";
  @observable email = "";
  @observable firstName = "";
  @observable lastName = "";
  @observable fullName = "";
  @observable avatar = "";
  @observable avatarThumb = "";
  @observable roles = [];
  @observable hasAvatar = false;

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
      this.loading = false;

      const { data } = resp;

      this.username = data.username;
      this.phone = data.phone || "";
      this.title = data.title || "";
      this.email = data.email;
      this.firstName = data.first_name;
      this.lastName = data.last_name;

      if (
        data.avatar &&
        data.avatar.indexOf("stitch-content/default-avatar") < 0
      ) {
        this.hasAvatar = true;
      }
      this.avatar = data.avatar;
      this.avatarThumb = data.avatar_thumb;

      this.roles = data.roles;
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
    return put(`/api/v1/users/${this.id}/upload_profile_image`, {
      body: {
        url: profileImgUrl
      },
      hideNotify: true
    }).then(resp => {
      const { data } = resp;
      this.avatar = data.avatar;
      this.avatarThumb = data.avatar_thumb;

      // Keep usersStore avatar fields updated
      const avatarFields = pick(data, "avatar", "avatar_thumb");
      this.rootStore.usersStore.updateUserData(this.id, avatarFields);
      this.hasAvatar = true;
    });
  };

  @action
  deleteProfileImg = () => {
    return remove(`/api/v1/users/${this.id}/delete_profile_image`, {
      hideNotify: true
    }).then(resp => {
      const { data } = resp;
      this.avatar = data.avatar;
      this.avatarThumb = data.avatar_thumb;

      // Keep usersStore avatar fields updated
      const avatarFields = pick(data, "avatar", "avatar_thumb");
      this.rootStore.usersStore.updateUserData(this.id, avatarFields);
      this.hasAvatar = false;
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
}

export default UserStore;
