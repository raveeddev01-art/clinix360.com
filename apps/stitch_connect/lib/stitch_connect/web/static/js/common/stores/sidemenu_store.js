/**
 * Sidemenu store
 *
 * This is a mobx store that keeps track of data related to sidemenu and global state.
 */

import { observable, computed, action } from "mobx";
import Favico from "favico.js";
import { scroller } from "react-scroll";

import {
  NOTIFICATION_CARD_DURATION,
  ROOM_MENU_ITEM_ANCHOR_PREFIX
} from "../../lib/constants";
import history from "../../lib/history";

class SidemenuStore {
  @observable loadedApp = false; // If TRUE, indicates that loaded necessary data to start the app, that is, users and groups
  @observable sidemenuDiv = null; // Div element of sidemenu
  @observable roomMenuItemVisibles = {};
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable isInChat = false;

  badge = null;
  desktopBadge = null;
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
  // METHODS //
  // /////// //

  @action
  loadApp = async () => {
    const { usersStore, groupsStore, presenceStore } = this.rootStore;

    try {
      if (!presenceStore.locked) {
        // Only fetch users and groups when the app is NOT locked, to keep info secure
        await Promise.all([usersStore.loadUsers(), groupsStore.loadGroups()]);
      }

      this.loadedApp = true;
    } catch (e) {
      // TODO if error occurs here, redirect to error page

      console.error(e); // eslint-disable-line
    }

    // Hide the HTML loading elements.
    $(".html-loading-element").remove();
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
    const { groupStore, presenceStore } = this.rootStore;

    return (
      !presenceStore.locked &&
      groupStore.group &&
      groupId === groupStore.group.id &&
      document.hasFocus()
    );
  }

  updateFavicon() {
    const {
      groupsStore: { totalMentionsCount, totalUnreadMessagesCount }
    } = this.rootStore;
    let badge = "";
    let desktopBadge = "";

    if (totalMentionsCount > 9) {
      badge = "9+";
      desktopBadge = "9+";
    } else if (totalMentionsCount > 0) {
      badge = `${totalMentionsCount}`;
      desktopBadge = `${totalMentionsCount}`;
    } else if (totalUnreadMessagesCount > 0) {
      desktopBadge = "•";
    }

    if (badge !== this.badge) {
      this.badge = badge;
      this.favicon.badge(badge);
    }

    if (desktopBadge !== this.desktopBadge) {
      this.desktopBadge = desktopBadge;

      // to be consumed by electron app
      window.dispatchEvent(
        new CustomEvent("unread-changed", { detail: desktopBadge })
      );
    }
  }

  playNotificationAudio() {
    this.notificationAudio.play();
  }

  showNotificationCard(title, body, tag, onClick = null) {
    this.playNotificationAudio();

    if (!Notification) {
      // in case browser does not support
      return;
    }

    const notification = new Notification(title, {
      body,
      tag,
      icon: "/favicon-192x192.png",
      silent: true
    });

    if (onClick) {
      notification.onclick = onClick;
    }

    setTimeout(() => {
      notification.close();
    }, NOTIFICATION_CARD_DURATION);
  }

  showNotificationCardForNewMessage(message) {
    if (
      this.isOwnMessage(message) ||
      this.notificationNotAllowed() ||
      this.isCurrentlyInRoom(message.group_id) ||
      this.isSystemMessage(message)
    ) {
      return;
    }

    const { notificationStore, groupsStore } = this.rootStore;

    // GET GROUP PREFERENCE
    const groupPreference = notificationStore.getGroupPrefById(
      message.group_id
    );
    const notifyOnAll = groupPreference === "everything";
    const notifyOnMention = groupPreference === "mentions";

    // GET MSG TYPE
    const group = groupsStore.getGroupById(message.group_id);
    const isMention = message.mentioned_user_ids.includes(currentUser.id);
    const isDirect = this.isSingleDM(group) || this.isMultiDM(group);

    const notifyOnMessageType =
      notifyOnAll || (notifyOnMention && (isMention || isDirect));

    // SHORT CIRCUIT UNLESS CORRECT TYPE
    if (!notifyOnMessageType) {
      return;
    }

    // SENDING THE MESSAGE
    this.showNotificationCard(
      this.getNotificationTitle(group),
      this.getNotificationText(message, group, isMention),
      "new-message", // notification tag
      this.getOnNotificationClick(message)
    );
  }

  getNotificationTitle(group) {
    return `${this.rootStore.groupsStore.getGroupName(group)}`;
  }

  getNotificationText(message, group, isMention) {
    const senderName = `${message.user.first_name} ${message.user.last_name}`;
    const messageBody = this.getMessageBody(message, group, isMention);

    return `${senderName} ${messageBody}`;
  }

  getMessageBody(message, group, isMention) {
    if (this.isUpload(message)) {
      return "uploaded a file.";
    }

    if (this.isSingleDM(group)) {
      return "sent you a direct message.";
    }

    if (this.isMultiDM(group)) {
      return isMention
        ? "mentioned you in a direct message."
        : "sent a direct message.";
    }

    // Room Messages
    return isMention
      ? "mentioned you in a room message."
      : "sent a new room message.";
  }

  getOnNotificationClick = message => () => {
    this.goToMessageRoom(message);
    window.dispatchEvent(new CustomEvent("notification-clicked"));
  };

  notificationNotAllowed() {
    return window.Notification && Notification.permission !== "granted";
  }

  isOwnMessage(message) {
    return message.user_id === currentUser.id;
  }

  isSystemMessage(message) {
    return message.type === "system";
  }

  isSingleDM(group) {
    return group.type === "dm";
  }

  isMultiDM(group) {
    return group.type === "multi_dm";
  }

  isUpload(message) {
    return message.type === "upload";
  }

  goToMessageRoom(message) {
    const { groupsStore } = this.rootStore;
    const url = groupsStore.getGroupUrl(message.group_id);
    window.focus();
    history.push(url);
  }

  jumpToMessage(message) {
    this.goToMessageRoom(message);
    this.rootStore.messageStore.jumpToMessage(message);
  }

  scrollToRoomItem(roomId, duration = 300) {
    const anchorName = `${ROOM_MENU_ITEM_ANCHOR_PREFIX}${roomId}`;

    scroller.scrollTo(anchorName, {
      container: this.sidemenuDiv,
      smooth: true,
      duration
    });
  }

  // ////////////// //
  // EVENT HANDLERS //
  // ////////////// //

  @action
  onNewMessage = message => {
    const { groupStore, groupsStore } = this.rootStore;

    // If the message is system message or for the current group, ignore
    if (
      message.type === "system" ||
      (groupStore.group &&
        message.group_id === groupStore.group.id &&
        this.isInChat) ||
      message.user_id === currentUser.id
    ) {
      return;
    }

    const group = groupsStore.getGroupById(message.group_id);
    const isMention = message.mentioned_user_ids.includes(currentUser.id);

    if (group) {
      group.unread_messages_count += 1;

      if (isMention) {
        group.mentions_count += 1;
      }

      // if it's DM and hidden, show it on sidebar
      if (group.type !== "regular" && group.is_hidden) {
        // just make it unhidden by assuming it's already unhidden when new msg is broadcasted over dm
        groupsStore.updateGroupData(group.id, { is_hidden: false });
      }
    }

    // Update Favicon
    this.updateFavicon();

    // Show notification card
    this.showNotificationCardForNewMessage(message);
  };

  @action
  onTeamRenamed = ({ name }) => {
    const { teamStore } = this.rootStore;

    this.teamName = name;
    teamStore.onRenamed({ name });
  };
}

export default SidemenuStore;
