import { observable, computed, action } from "mobx";
import Favico from "favico.js";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable groups = [];
  @observable users = [];
  @observable groupCursors = {}; // { group_id: message_id }
  badge = null;
  favicon = null;
  notificationAudio = null;

  constructor(rootStore, props) {
    this.rootStore = rootStore;
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
    this.users = props.dm_users || [];

    this.favicon = new Favico({
      animation: "none",
      position: "up"
    });
    this.notificationAudio = new Audio("/audios/pop.mp3");

    this.loadGroups();
    this.loadUsers();
  }

  @computed
  get normalGroups() {
    return this.groups.filter(
      group => group.type === "regular" && !group.favorite
    );
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
  get totalMentionsCount() {
    return this.groups.reduce((count, group) => {
      if (group.type === "regular") {
        return count + group.mentions_count;
      }

      return count + group.unread_messages_count;
    }, 0);
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
  updateGroupCursor = (groupId, cursor) => {
    this.groupCursors[groupId] = cursor;
  };

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
   * Returnns if the user is 'Currently in' the group
   * 'Currently in' requires that the user is in the room + 'Active'
   *
   * @param {*} groupId
   */
  isCurrentlyInRoom(groupId) {
    return (
      groupId === this.rootStore.groupStore.id &&
      !this.locked &&
      document.hasFocus()
    );
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
    let badge = "";
    if (this.totalMentionsCount > 9) {
      badge = "9+";
    } else if (this.totalMentionsCount > 0) {
      badge = `${this.totalMentionsCount}`;
    }

    // avoid favicon animation when not changed
    if (badge !== this.badge) {
      this.badge = badge;
      this.favicon.badge(badge);
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

  showNotificationCard(title, body, duration = 5000) {
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
        regular: "group",
        dm: "direct",
        multi_dm: "direct"
      };

      const author = `${newMessage.user.first_name} ${newMessage.user
        .last_name}`;
      const predicative = isMention
        ? "mentioned you in"
        : predicatives[group.type];
      const messageType = messageTypes[group.type];

      this.showNotificationCard(
        `${group.type === "regular" ? "#" : ""}${group.name}`,
        `${author} ${predicative} a ${messageType} message`
      );
    }
  }
}

export default SidemenuStore;
