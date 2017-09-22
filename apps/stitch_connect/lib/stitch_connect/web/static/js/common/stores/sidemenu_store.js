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

  active = true; // If TRUE, the user is currently active in the app
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

    // Update Favicon
    this.updateFavicon();

    // Play notification audio
    this.playNotificationAudioForNewMessage(newMessage);

    // Show notification card
    this.showNotificationCardForNewMessage(newMessage);
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
    this.active = false;
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
      this.active = true;
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

  setActive() {
    if (this.locked) {
      return;
    }

    this.active = true;
  }

  setInactive() {
    this.active = false;
  }

  /**
   * Returnns if the user is 'Currently in' the group
   * 'Currently in' requires that the user is in the room + 'Active'
   * 
   * @param {*} groupId 
   */
  isCurrentlyInRoom(groupId) {
    return groupId === this.rootStore.groupStore.id && this.active;
  }

  /**
   * Check if notification should be made for the message
   * 
   *  Should notify ONLY when
   *    - message is from others AND
   *    - user is not 'Currently in' the room
   * 
   * @param {*} newMessage 
   */
  shouldNotify(newMessage) {
    return (
      newMessage.user_id !== currentUser.id &&
      !this.isCurrentlyInRoom(newMessage.group_id)
    );
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

  playNotificationAudioForNewMessage(newMessage) {
    if (!this.shouldNotify(newMessage)) {
      return;
    }

    const { notificationStore } = this.rootStore;
    const desktopNotification = notificationStore.getGroupNotificationPreference(
      newMessage.group_id
    );
    const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

    if (
      desktopNotification === "everything" ||
      (desktopNotification === "mentions" && isMention)
    ) {
      this.playNotificationAudio();
    }
  }

  showNotificationCard(title, body, duration = 3000) {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico"
    });

    setTimeout(() => {
      notification.close();
    }, duration);
  }

  showNotificationCardForNewMessage(newMessage) {
    if (
      !this.shouldNotify(newMessage) ||
      Notification.permission === "denied"
    ) {
      return;
    }

    const { notificationStore } = this.rootStore;
    const desktopNotification = notificationStore.getGroupNotificationPreference(
      newMessage.group_id
    );
    const group = this.groups.find(g => g.id === newMessage.group_id);
    const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

    if (
      desktopNotification === "everything" ||
      (desktopNotification === "mentions" && isMention)
    ) {
      const predicatives = {
        regular: "sent",
        dm: "sent you",
        multi_dm: "sent you"
      };
      const messageTypes = {
        regular: "room",
        dm: "1-on-1",
        multi_dm: "direct"
      };

      const author = `${newMessage.user.first_name} ${newMessage.user
        .last_name}`;
      const predicative = isMention
        ? "mentioned you in"
        : predicatives[group.type];
      const messageType = messageTypes[group.type];

      this.showNotificationCard(
        author,
        `${author} ${predicative} a ${messageType} message`
      );
    }
  }
}

export default SidemenuStore;
