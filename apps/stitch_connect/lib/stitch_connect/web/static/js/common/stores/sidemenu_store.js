import { observable, computed, action } from "mobx";
import Favico from "favico.js";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable groups = [];
  @observable users = [];
  @observable locked = false;
  @observable unlocking = false; // Flag that indicates if unlocking request is being made

  inactivityTimeout = -1;
  inactivityTimer = null;
  favicon = null;
  notificationAudio = null;

  constructor(rootStore, props) {
    this.rootStore = rootStore;
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
    this.users = props.dm_users || [];

    this.favicon = new Favico({
      animation: "slide"
    });
    this.notificationAudio = new Audio("/audios/pop.mp3");

    this.loadGroups();
    this.loadUsers();
  }

  @computed
  get singleDMGroupsMap() {
    const singleDMGroups = this.groups.filter(group => group.type === "dm");
    const userMap = {};
    singleDMGroups.forEach(group => {
      const user = group.users.find(u => u.id !== currentUser.id);
      userMap[user ? user.id : currentUser.id] = group;
    });
    return userMap;
  }

  @computed
  get normalGroups() {
    return this.groups.filter(group => group.type === "regular");
  }

  @computed
  get directGroups() {
    return this.groups.filter(group => group.type !== "regular");
  }

  @computed
  get multiDMGroups() {
    return this.groups.filter(group => group.type === "multi_dm");
  }

  @computed
  get favoriteGroups() {
    return this.groups.filter(group => group.favorite);
  }

  @computed
  get usernameMap() {
    const map = {};
    this.users.forEach(user => {
      map[user.username] = user;
    });
    return map;
  }

  @computed
  get totalUnreadMessagesCount() {
    return this.groups.reduce(
      (count, group) => count + group.unread_messages_count,
      0
    );
  }

  @action
  loadGroups = () => {
    get("/api/v1/groups").then(response => {
      this.groups = response.data;
      this.updateFavicon();
    });
  };

  @action
  onNewGroup = newGroup => {
    this.groups.push(newGroup);
  };

  @action
  onNewMessage = newMessage => {
    // If the message is for the current group, ignore
    if (newMessage.group_id === this.rootStore.groupStore.id) {
      return;
    }

    const group = this.groups.find(g => g.id === newMessage.group_id);
    const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

    if (!group) {
      return;
    }

    group.unread_messages_count += 1;
    if (isMention) {
      group.mentions_count += 1;
    }

    this.updateFavicon();

    // Play sound notification
    this.playNewMessageNotificationForGroup(newMessage.group_id, isMention);
  };

  @action
  updateGroupData = (id, data) => {
    const index = this.groups.findIndex(group => group.id === id);
    if (index > -1) {
      Object.assign(this.groups[index], data);
    }
  };

  @action
  lock() {
    // TODO: POST `/api/v1/session-lock`
    this.locked = true;
  }

  /**
   * Unlock the session by calling backend api
   *
   * @param {String} pin
   */
  @action
  unlock(pin) {
    // TODO: POST `/api/v1/session-unlock`
    // In then response, cancel `unlocking` flag
    // In error response, show notification `Incorrect password`

    /*
    this.unlocking = true;
    post(`/api/v1/session-unlick`, { pin }).then(() => {
      this.locked = false;
    }, (error) => {
      notify.show(error);
    })
    .finally(() => {
      this.unlocking = false;
    })
    */

    // Mocking the api call using timeout
    this.unlocking = true;

    setTimeout(() => {
      this.unlocking = false;
      this.locked = false;
    }, 2000);
  }

  loadUsers = () => {
    get("/api/v1/users").then(response => {
      this.users = response.data;
    });
  };

  selectRoom = room => {
    this.selectedRoom = room;
  };

  getGroupById = id => this.groups.find(group => group.id === id);

  /**
   * Get lock state for the current session from the server
   */
  getLockState() {
    // TODO: Get lock state for the current session from the server
  }

  /**
   * Retrieve from the server timeout amount for which the user gets locked if he is inactive
   */
  getInactivityTimeout() {
    // TODO: Get from backend server

    this.inactivityTimeout = 60 * 60; // Default: 1 hour
  }

  startInactivityTimer() {
    if (this.locked) {
      return;
    }

    this.stopInactivityTimer();

    this.inactivityTimer = window.setTimeout(() => {
      this.lock();
      this.stopInactivityTimer();
    }, this.inactivityTimeout * 1000);
  }

  stopInactivityTimer() {
    if (this.inactivityTimer) {
      window.clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  updateFavicon() {
    if (this.totalUnreadMessagesCount > 0) {
      this.favicon.badge(" ");
    } else {
      this.favicon.badge("");
    }
  }

  playNotificationAudio() {
    this.notificationAudio.play();
  }

  playNewMessageNotificationForGroup(groupId, isMention) {
    const { notificationStore } = this.rootStore;
    const desktopNotification = notificationStore.getGroupNotificationPreference(
      groupId
    );

    if (desktopNotification === "everything") {
      this.playNotificationAudio();
    } else if (desktopNotification === "mentions" && isMention) {
      this.playNotificationAudio();
    }
  }
}

export default SidemenuStore;
