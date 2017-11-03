import { observable, computed, action } from "mobx";

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
  saveName = (first_name, last_name) => {
    this.save({ first_name, last_name }).then(() => {
      this.firstName = first_name;
      this.lastName = last_name;
      notify.show("Name updated");
    });
  };

  @action
  savePhone = phone_number => {
    this.save({ phone_number }).then(() => {
      this.phone = phone_number;
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
  saveProfileImg = profile_image_url => {
    this.save({ profile_image_url }).then(() => {
      this.profileImg = profile_image_url;
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
