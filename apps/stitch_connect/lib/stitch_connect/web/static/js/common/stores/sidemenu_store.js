/**
 * Sidemenu store
 * 
 * This is a mobx store that keeps track of data related to sidemenu and global state.
 */

import { observable, computed, action } from "mobx";
import Favico from "favico.js";
import { scroller } from "react-scroll";

import { ROOM_MENU_ITEM_ANCHOR_PREFIX } from "../../util/constants";

class SidemenuStore {
  @observable loading = false; // IF True, shows loading page
  @observable sidemenuDiv = null; // Div element of sidemenu
  @observable roomMenuItemVisibles = {};
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";

  badge = null;
  favicon = null;
  notificationAudio = null;

  constructor(rootStore, props) {
    this.rootStore = rootStore;

    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;

    this.favicon = new Favico({
      animation: "none",
      position: "up"
    });
    this.notificationAudio = new Audio("/audios/pop.mp3");
  }

  // //////// //
  // COMPUTED //
  // //////// //

  @computed
  get unreadRoomItemHiddenUp() {
    const { groupsStore: { roomsInShowOrder } } = this.rootStore;

    if (!Object.keys(roomsInShowOrder).length) {
      return null;
    }

    let room = null;

    for (let i = 0; i < roomsInShowOrder.length; i += 1) {
      const r = roomsInShowOrder[i];

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
    const { groupsStore: { roomsInShowOrder } } = this.rootStore;

    if (!Object.keys(roomsInShowOrder).length) {
      return null;
    }

    let room = null;

    for (let i = roomsInShowOrder.length - 1; i >= 0; i -= 1) {
      const r = roomsInShowOrder[i];

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

  // //////////
  // ACTIONS //
  // /////// //

  @action
  loadApp = async () => {
    const { presenceStore, usersStore, groupsStore } = this.rootStore;

    if (!presenceStore.locked) {
      this.loading = true;

      await usersStore.loadUsers();
      await groupsStore.loadGroups();

      this.loading = false;
    }
  };

  @action
  onNewMessage = newMessage => {
    const { groupStore, groupsStore } = this.rootStore;

    // If the message is for the current group, ignore
    if (newMessage.group_id === groupStore.id) {
      return;
    }

    const group = groupsStore.getGroupById(newMessage.group_id);
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
        const sidebarGroup = groupsStore.getGroupById(group.id);
        sidebarGroup.is_hidden = false;
      });
    }
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

  selectRoom = room => {
    this.selectedRoom = room;
  };

  /**
   * Returnns if the user is 'Currently in' the group
   * 'Currently in' requires that the user is in the room + 'Active'
   *
   * @param {*} groupId
   */
  isCurrentlyInRoom(groupId) {
    const { groupStore } = this.rootStore;

    return groupId === groupStore.id && !this.locked && document.hasFocus();
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
    const { groupsStore: { totalMentionsCount } } = this.rootStore;
    let badge = "";

    if (totalMentionsCount > 9) {
      badge = "9+";
    } else if (totalMentionsCount > 0) {
      badge = `${totalMentionsCount}`;
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

    const { notificationStore, messageStore, groupsStore } = this.rootStore;
    if (messageStore.groupId === newMessage.group_id) return;
    const desktopNotification = notificationStore.getGroupNotificationPreference(
      newMessage.group_id
    );
    const group = groupsStore.getGroupById(newMessage.group_id);
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
    const { groupsStore } = this.rootStore;
    const group = groupsStore.getGroupById(message.group_id);
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
    const anchorName = `${ROOM_MENU_ITEM_ANCHOR_PREFIX}${roomId}`;

    scroller.scrollTo(anchorName, {
      container: this.sidemenuDiv,
      smooth: true,
      duration
    });
  }

  @action
  onTeamRenamed = ({ name }) => {
    const { teamStore } = this.rootStore;

    this.teamName = name;
    teamStore.onRenamed({ name });
  };
}

export default SidemenuStore;
