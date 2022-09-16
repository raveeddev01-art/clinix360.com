/**
 * User store
 *
 * This store keeps track of data of current logged in user
 */

import { observable, action, computed } from "mobx";
import pick from "lodash/pick";
import difference from "lodash/difference";
import { getTimezone } from "../../lib/utils";

// const defaultAvatars = ["/images/default-avatar.png"];

class UserStore {
  @observable id = currentUser.id;
  @observable loading = false;
  @observable username = currentUser.username;
  @observable phone = currentUser.phone || "";
  @observable title = currentUser.title || "";
  @observable email = currentUser.email;
  @observable firstName = currentUser.firstName;
  @observable lastName = currentUser.lastName;
  @observable fullName = `${this.firstName} ${this.lastName}`;
  @observable avatar = currentUser.avatar;
  @observable status = {active: false};
  @observable statusHistory = [];
  @observable showUserStatusModal = null;
  @observable avatarThumb = currentUser.avatar_thumb;
  @observable roles = currentUser.roles;
  @observable timezone = getTimezone();
  @observable hasAvatar = this.userHasAvatar();
  @observable roleChanged = false;
  @observable connectTourStatus = currentUser.connect_tour_status;
  @observable platformTourStatus = currentUser.platform_tour_status;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.userStatus();
    this.statusHistory();
  }

  userHasAvatar() {
    if (
      currentUser.avatar &&
      currentUser.avatar.indexOf("stitch-content/default-avatar") < 0
    ) {
      return true;
    }
    return false;
  }

  @computed
  get isAdmin() {
    return this.roles.indexOf("admin") > -1;
  }

  @computed
  get canInvite() {
    return (
      this.isAdmin ||
      (this.rootStore.teamStore.openInvitationsEnabled &&
        this.roles.includes("member"))
    );
  }

  @action
  onUserInfo = user => {
    this.avatar = user.avatar;
    this.avatarThumb = user.avatar_thumb;
    this.status = user.status;

    // show role change modal if groups assigned as guests or roles has changed
    if (
      difference(user.roles || [], this.roles || []).length ||
      difference(user.groups_as_guest || [], this.groups_as_guest || []).length
    ) {
      this.roles = user.roles;
      currentUser.roles = user.roles;
      this.groups_as_guest = user.groups_as_guest;
      this.roleChanged = true;
      this.rootStore.channelStore.leaveAllChannelsButTeamAndEvent();
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
  markConnectTourCompleted = () => {
    this.connectTourStatus = "completed";
    return this.save({ connect_tour_status: "completed" });
  };

  @action
  markPlatformTourCompleted = () => {
    this.platformTourStatus = "completed";
    return this.save({ platform_tour_status: "completed" });
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
      this.fullName = `${firstName} ${lastName}`;
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
    }).then(resp => {
      window.authenticationToken = resp.data.token;
    });
  };
  
  @action
  deactivateAccount = () => {
    return post(`/api/v1/users/deactivate-my-account`, {
      body: {},
      hideNotify: true
    });
  };

  @action
  userStatus = () => {
    return get(`/api/v1/users/${this.id}/user_status`, {})
    .then(resp => {
      console.log("resp", resp);
      this.status = resp.data;
    });    
  }

  @action
  saveStatus = (text, emoji, clearAfter, customTime = "") => {
    return post(`/api/v1/users/${this.id}/user_status`, {
      body: {
        text: text,
        emoji: emoji.colons,
        clear_after: clearAfter,
        custom_time: customTime
      }
    });
  }

  @action
  clearStatus = () => {
    return put(`/api/v1/users/${this.id}/clear_status`, {})
    .then(resp => {
      if(resp.data.status === "ok") {
        this.status = {};
      }
    });
  }

  @action
  deleteStatus = (status_id) => {
    return remove(`/api/v1/users/${this.id}/delete_status`, {
      body: {
        status_id: status_id
      }
    }).then(resp => {
      this.statusHistory = resp.data;
    });
  }

  @action
  statusHistory = () => {
    return get(`/api/v1/users/${this.id}/status_history`, {})
    .then(resp => {
      console.log("resp", resp);
      this.statusHistory = resp.data;
    });
  }

}

export default UserStore;
