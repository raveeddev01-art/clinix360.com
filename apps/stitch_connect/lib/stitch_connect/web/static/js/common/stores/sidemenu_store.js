import { observable, computed, action } from "mobx";
import Favico from "favico.js";
import { scroller } from "react-scroll";
import orderBy from "lodash/orderBy";
import history from "../../util/history";

class SidemenuStore {
  @observable sidemenuDiv = null; // Div element of sidemenu
  @observable roomMenuItemVisibles = {};
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable groups = [];
  @observable users = [];
  @observable groupCursors = {}; // { group_id: message_id }

  ROOM_MENU_ITEM_ANCHOR_PREFIX = "sidemenu_room_";
  badge = null;
  favicon = null;
  notificationAudio = null;
  history = null;

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
  get favoriteGroups() {
    return this.groups.filter(group => group.favorite);
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
  get roomsInShowOrder() {
    return this.favoriteGroups.concat(this.normalGroups, this.directGroups);
  }

  @computed
  get unreadRoomItemHiddenUp() {
    if (!Object.keys(this.roomsInShowOrder).length) {
      return null;
    }

    let room = null;

    for (let i = 0; i < this.roomsInShowOrder.length; i += 1) {
      const r = this.roomsInShowOrder[i];

      if (this.roomMenuItemVisibles[r.id]) {
        break;
      }

      if (r.unread_messages_count > 0) {
        room = r;
        break;
      }
    }

    return room;
  }

  @computed
  get unreadRoomItemHiddenDown() {
    if (!Object.keys(this.roomsInShowOrder).length) {
      return null;
    }

    let room = null;

    for (let i = this.roomsInShowOrder.length - 1; i >= 0; i -= 1) {
      const r = this.roomsInShowOrder[i];

      if (this.roomMenuItemVisibles[r.id]) {
        break;
      }

      if (r.unread_messages_count > 0) {
        room = r;
        break;
      }
    }

    return room;
  }

  @computed
  get usersByUsername() {
    const map = {};

    this.users.forEach(user => {
      map[user.username] = user;
    });

    return map;
  }

  @computed
  get usersById() {
    const map = {};

    this.users.forEach(user => {
      map[user.id] = user;
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
      this.groups = orderBy(response.data, ["name"]);
      this.updateFavicon();
    });
  };

  @action
  onNewGroup = newGroup => {
    this.groups.push(newGroup);
  };

  @action
  hideGroup = id => {
    return put(`/api/v1/groups/${id}/hide`);
  };

  @action
  onRenameGroup = params => {
    const data = {
      slug: params.group_slug,
      name: params.group_name
    };

    this.updateGroupData(params.group_id, data);

    if (this.rootStore.groupStore.id === params.group_id) {
      history.push(`/rooms/${params.group_slug}`);
    }
  };

  @action
  onJoinedGroup = joinedGroup => {
    const group = this.groups.find(g => g.id === joinedGroup.id);

    if (group) {
      group.joined = true;
    }
  };

  @action
  onLeftGroup = ({ group_id: groupId }) => {
    const group = this.groups.find(g => g.id === groupId);

    if (group) {
      group.joined = false;
    }
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

    // if it's DM and hidden, show it on sidebar
    if (group.type !== "regular" && group.is_hidden) {
      put(`/api/v1/groups/${group.id}/unhide`).then(() => {
        const sidebarGroup = this.groups.find(g => g.id === group.id);
        sidebarGroup.is_hidden = false;
      });
    }
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

  /**
   * Registers sidemenu div
   *
   * @param {DOMElement} div
   */
  loadSidemenuDiv(div) {
    this.sidemenuDiv = div;
  }

  /**
   * Unregisters sidemenu div
   *
   */
  unloadSidemenuDiv() {
    this.sidemenuDiv = null;
  }

  onRoomMenuItemShow(roomId) {
    this.roomMenuItemVisibles = {
      ...this.roomMenuItemVisibles,
      [roomId]: true
    };
  }

  onRoomMenuItemHide(roomId) {
    this.roomMenuItemVisibles = {
      ...this.roomMenuItemVisibles,
      [roomId]: false
    };
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
      // to be consumed by electron app
      window.dispatchEvent(
        new CustomEvent("unread-changed", { detail: badge })
      );
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

  showNotificationCard(title, body, tag, duration = 5000, cb = null) {
    const notification = new Notification(title, {
      body,
      tag,
      icon: "/favicon-192x192.png",
      silent: true
    });

    if (cb) {
      notification.onclick = cb;
    }

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

    const { notificationStore, messageStore } = this.rootStore;
    if (messageStore.groupId === newMessage.group_id) return;
    const desktopNotification = notificationStore.getGroupNotificationPreference(
      newMessage.group_id
    );
    const group = this.groups.find(g => g.id === newMessage.group_id);
    const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

    if (
      desktopNotification === "everything" ||
      (desktopNotification === "mentions" && isMention)
    ) {
      const message = isMention
        ? "mentioned you"
        : group.type === "regular"
          ? "sent a room message"
          : "sent you a message";
      const text = `${newMessage.user.first_name} ${newMessage.user
        .last_name} ${message}`;
      this.showNotificationCard(
        `${group.name}`,
        text,
        "new-message",
        5000,
        event => {
          this.jumpToMessage(newMessage);
          window.dispatchEvent(new CustomEvent("notification-clicked"));
        }
      );
    }
  }

  jumpToMessage(message) {
    const group = this.getGroupById(message.group_id);
    let url;

    if (group.type === "regular") {
      // If normal group
      url = `/rooms/${group.slug}`;
    } else if (group.type === "multi_dm") {
      // If multi direct messaging
      const multiMessagingSlug = group.users
        .map(user => user.username)
        .join(",");
      url = `/direct/${multiMessagingSlug}`;
    } else {
      // If single direct messaging
      const recipient = group.users.find(user => user.id !== currentUser.id);
      url = `/direct/${recipient.username}`;
    }

    history.push(url);
  }

  scrollToRoomItem(roomId, duration = 300) {
    const anchorName = `${this.ROOM_MENU_ITEM_ANCHOR_PREFIX}${roomId}`;

    scroller.scrollTo(anchorName, {
      container: this.sidemenuDiv,
      smooth: true,
      duration
    });
  }

  @action
  onUserJoined = user => {
    this.users.push(user);
  };

  @action
  onUserInfo = user => {
    const index = this.users.findIndex(u => u.id === user.id);

    this.users[index] = user;

    if (user.id === currentUser.id) {
      const { userStore } = this.rootStore;

      userStore.onUserInfo(user);
    }
  };

  @action
  onTeamRenamed = ({ name }) => {
    const { teamStore } = this.rootStore;

    this.teamName = name;
    teamStore.onRenamed({ name });
  };
}

export default SidemenuStore;
