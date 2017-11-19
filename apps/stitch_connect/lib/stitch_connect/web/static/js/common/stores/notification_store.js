import { observable, action } from "mobx";

class NotificationStore {
  @observable groupPreferences = [];
  @observable groupPreferenceMap = new Map();
  @observable desktopPreference = null;
  @observable emailPreference = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
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
  toggleGroupPreferences = () => {
    this.groupPreferences.forEach(preference => {
      this.groupPreferenceMap.set(
        preference.group_id,
        preference.desktop_notification_preference
      );
    });
  };

  @action
  updateGroupPreferences = () => {
    return put("/api/v1/users/notification-preference", {
      body: {
        group_preferences: this.groupPreferences.map(preference => ({
          group_id: preference.group_id,
          desktop_notification_preference: this.groupPreferenceMap.get(
            preference.group_id
          )
        }))
      }
    }).then(() => {
      this.groupPreferences.forEach(preference => {
        preference.desktop_notification_preference = this.groupPreferenceMap.get(
          preference.group_id
        );
      });
    });
  };

  @action
  updateDesktopPreference = val => {
    return put("/api/v1/users/notification-preference", {
      body: {
        desktop_notification_preference: val
      },
      hideNotify: true
    }).then(() => {
      this.desktopPreference = val;
      return val;
    });
  };

  @action
  updateEmailPreference = val => {
    return put("/api/v1/users/notification-preference", {
      body: {
        email_notification_preference: val
      },
      hideNotify: true
    }).then(() => {
      this.emailPreference = val;
      return val;
    });
  };
}

export default NotificationStore;
