import { observable, action } from "mobx";

class NotificationStore {
  @observable groupPreferences = [];
  @observable groupPreferenceMap = {};
  @observable desktopPreference = null;
  @observable emailPreference = null;
  @observable openGroupPreferences = false;

  constructor() {
    this.loadPreferences();
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
  toggleGroupPreferences = val => {
    this.openGroupPreferences = val;
    if (val) {
      this.groupPreferenceMap = {};
      this.groupPreferences.forEach(preference => {
        this.groupPreferenceMap[preference.group_id] =
          preference.desktop_notification_preference;
      });
    }
  };

  @action
  updateGroupPreferences = () => {
    return put("/api/v1/users/notification-preference", {
      body: {
        group_preferences: Object.keys(
          this.groupPreferenceMap
        ).map(groupId => ({
          group_id: groupId,
          desktop_notification_preference: this.groupPreferenceMap[groupId]
        }))
      }
    }).then(() => {
      this.groupPreferences.forEach(preference => {
        preference.desktop_notification_preference = this.groupPreferenceMap[
          preference.group_id
        ];
      });
    });
  };

  @action
  updateDesktopPreference = val => {
    return put("/api/v1/users/notification-preference", {
      body: {
        desktop_notification_preference: val
      }
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
      }
    }).then(() => {
      this.emailPreference = val;
      return val;
    });
  };
}

const store = new NotificationStore();
export default store;
