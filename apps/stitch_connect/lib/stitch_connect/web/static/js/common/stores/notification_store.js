import { observable, action } from "mobx";

class NotificationStore {
  @observable groupPreferences = [];
  @observable desktopPreference = null;
  @observable emailPreference = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  getGroupPreference(groupId) {
    const groupPreference = this.groupPreferences.find(
      p => p.group_id === groupId
    );

    return groupPreference
      ? groupPreference.desktop_notification_preference
      : this.desktopPreference;
  }

  @action
  loadPreferences = () => {
    get("/api/v1/users/notification-preference").then(response => {
      this.groupPreferences = response.data.group_preferences;
      this.desktopPreference = response.data.desktop_notification_preference;
      this.emailPreference = response.data.email_notification_preference;
    });
  };

  @action
  updateGroupPreferences = groupPreferences => {
    return put("/api/v1/users/notification-preference", {
      body: {
        group_preferences: groupPreferences
      }
    }).then(() => {
      this.groupPreferences.replace(groupPreferences);
    });
  };

  @action
  updateDesktopPreference = preference => {
    return put("/api/v1/users/notification-preference", {
      body: {
        desktop_notification_preference: preference
      },
      hideNotify: true
    }).then(() => {
      this.desktopPreference = preference;
    });
  };

  @action
  updateEmailPreference = preference => {
    return put("/api/v1/users/notification-preference", {
      body: {
        email_notification_preference: preference
      },
      hideNotify: true
    }).then(() => {
      this.emailPreference = preference;
    });
  };
}

export default NotificationStore;
