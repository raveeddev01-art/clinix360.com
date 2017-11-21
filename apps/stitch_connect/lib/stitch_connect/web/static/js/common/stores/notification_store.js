import { observable, action } from "mobx";

class NotificationStore {
  @observable groupPrefs = [];
  @observable desktopPref = null;
  @observable emailPref = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getGroupPref(groupId) {
    const groupPref = this.groupPrefs.find(p => p.group_id === groupId);

    return groupPref
      ? groupPref.desktop_notification_preference
      : this.desktopPref;
  }

  @action
  loadPreferences = () => {
    get("/api/v1/users/notification-preference").then(response => {
      this.groupPrefs = response.data.group_preferences;
      this.desktopPref = response.data.desktop_notification_preference;
      this.emailPref = response.data.email_notification_preference;
    });
  };

  @action
  updateGroupPrefs = groupPrefs => {
    return put("/api/v1/users/notification-preference", {
      body: {
        group_preferences: groupPrefs
      }
    }).then(() => {
      this.groupPrefs.replace(groupPrefs);
    });
  };

  @action
  updateDesktopPref = preference => {
    return put("/api/v1/users/notification-preference", {
      body: {
        desktop_notification_preference: preference
      },
      hideNotify: true
    }).then(() => {
      this.desktopPref = preference;
    });
  };

  @action
  updateEmailPref = preference => {
    return put("/api/v1/users/notification-preference", {
      body: {
        email_notification_preference: preference
      },
      hideNotify: true
    }).then(() => {
      this.emailPref = preference;
    });
  };
}

export default NotificationStore;
