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
    return this.roles.includes("admin");
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

      this.loading = false;

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
  onUpdateUser = payload => {
    if (payload.roles) {
      window.currentUser.roles = payload.roles;
      this.roles = payload.roles;
    }
  };

  @action
  save = data => {
    return put(`/api/v1/users/${this.id}`, {
      body: data
    });
  };

  @action
  saveUsername = username => {
    this.save({ username }).then(() => {
      this.username = username;
      notify.show("Username updated");
    });
  };

  @action
  saveEmail = email => {
    this.save({ email }).then(() => {
      this.email = email;
      notify.show("Email updated");
    });
  };

  @action
  savePIN = pin => {
    this.save({ pin }).then(() => {
      this.pin = pin;
      notify.show("PIN updated");
    });
  };

  @action
  saveName = (firstName, lastName) => {
    this.save({ first_name: firstName, last_name: lastName }).then(() => {
      this.firstName = firstName;
      this.lastName = lastName;
      notify.show("Name updated");
    });
  };

  @action
  savePhone = phoneNumber => {
    this.save({ phone_number: phoneNumber }).then(() => {
      this.phone = phoneNumber;
      notify.show("Phone updated");
    });
  };

  @action
  saveTitle = title => {
    this.save({ title }).then(() => {
      this.title = title;
      notify.show("Title updated");
    });
  };

  @action
  saveProfileImg = profileImgUrl => {
    this.save({ profile_image_url: profileImgUrl }).then(() => {
      this.profileImg = profileImgUrl;
      notify.show("Profile Image updated");
    });
  };

  @action
  savePassword = (oldPassword, newPassword) => {
    return put(`/api/v1/users/${this.id}/update_password`, {
      body: {
        new_password: newPassword,
        old_password: oldPassword
      }
    }).then(() => {
      notify.show("Your password has been changed");
    });
  };
}

export default UserStore;
