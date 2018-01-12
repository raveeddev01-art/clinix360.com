/**
 * Message store
 *
 * This store keps track of data that are related with messages in the current group
 */

import { observable, action, computed, when, extendObservable } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll, scroller } from "react-scroll";
import Promise from "bluebird";
import shortid from "shortid";
import { START_TYPING_THROTTLE_MS } from "lib/constants";

class MessageStore {
  @observable chatDiv = null; // Div element of chat pane
  @observable messageElements = {}; // Div elements of messages loaded in the chat div

  @observable messages = []; // messages currently loaded

  @observable messageInEdit = null; // Message currently being edited
  @observable textInEdit = ""; // Current text of message in edit

  @observable jumpMode = false; // indicates if message list is currently at jumping mode

  @observable groupCursor = null;

  // Message loading status
  @observable loadedInitial = false; // If TRUE, indicates joined the chat channel and loaded the latest messages
  @observable loadedAll = false; // If TRUE, indicates that there is no more old messages to load from server
  @observable loadedAllRecent = false; // If TRUE, indicates that there is no more recent messages to load from server
  @observable loadedAround = new Map(); // { message_id: true } indicates if messages around the jumped message is loaded

  @observable isLoadingRecent = false;
  @observable isLoadingPast = false;
  @observable isScrollBottom = false; // TRUE if reached to the bottom scroll of chat div, otherwise FALSE

  @observable highlightId = null; // message will be highlighted

  messageTemp = null; // when switching to jumpm mode, stores current messages here so that we can restore them when use his `recent messages`

  // mobx when() monitor disposers
  joinedTargetGroupDisposer = null; // Disposer of when() monitor that waits until joined the group to which jumping target message belongs to
  mountedTargetMessageDisposer = null; // Disposer of when() monitor that waits until target messages is mounted

  readStatusCache = {}; // cache to store read status for when readstatus broadcast arrives before new_msg
  loadedGroupId = null; // indicates joined group id. populated after onJoinedGroup is run. It's to prevent onJoinedGroup happen again by rejoining internally in pheonix_socket.js
  @observable syncedTime = false; // sends timestamp only after synced time

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // ////////////// //
  //    GETTERS     //
  // ////////////// //

  getMessageById = id => this.messages.find(m => m.id === id);

  // Return the message that is immediately after the timestamp given, but not temp message
  getMessageAfterTimestamp = timestamp => {
    let index = this.messages.findIndex(m => m.inserted_at < timestamp) - 1;
    let message = null;

    while (index >= 0) {
      // Messages that has status set are the temp ones
      if (
        !this.messages[index].status &&
        this.messages[index].type !== "system"
      ) {
        message = this.messages[index];
        break;
      }

      index -= 1;
    }

    return message;
  };

  get groupChannel() {
    const { channelStore } = this.rootStore;

    return channelStore.groupChannel;
  }

  get eventChannel() {
    const { channelStore } = this.rootStore;

    return channelStore.eventChannel;
  }

  get group() {
    const { groupsStore } = this.rootStore;

    return groupsStore.currentGroup;
  }

  get unreadMessagesCount() {
    return this.group.unread_messages_count;
  }

  get mentionsCount() {
    return this.group.mentions_count;
  }

  get lastReadAt() {
    return this.group.last_read_at;
  }

  // Timestamp that the new message line should appear at
  get newMessageLineAt() {
    return this.group.new_message_line_at;
  }

  get markedAsUnread() {
    return this.group.marked_as_unread;
  }

  @computed
  get firstUnreadMessage() {
    return this.getMessageAfterTimestamp(this.lastReadAt);
  }

  @computed
  get lastOtherUserMessage() {
    return this.messages.find(m => m.user_id !== currentUser.id) || {};
  }

  /**
   * Returns the position of first unread message in chat div
   *
   * Possible return values are:
   *  'hidden-up': message is hidden in up the chat div
   *  'visible': message is visible
   *  'hidden-down': message is hidden in down the chat div
   */
  @computed
  get firstUnreadMessageVisibility() {
    if (!this.firstUnreadMessage || !this.loadedInitial || !this.groupCursor) {
      return "hidden-up";
    }

    const messageElement = this.messageElements[this.firstUnreadMessage.id];
    if (!messageElement) {
      return "hidden-up";
    }

    if (messageElement.visible) {
      return "visible";
    }

    return this.firstUnreadMessage.id < this.groupCursor
      ? "hidden-up"
      : "hidden-down";
  }

  @computed
  get newMessageLineMessage() {
    return this.getMessageAfterTimestamp(this.newMessageLineAt);
  }

  @computed
  get messagesByDate() {
    return (
      _.chain(this.messages)
        .sortBy("inserted_at")
        // Group messages by dates
        .groupBy(message =>
          moment
            .utc(message.inserted_at)
            .local()
            .format(`YYYY-MM-DD`)
        )
        .value()
    );
  }

  @computed
  get starredMessages() {
    return this.messages.filter(message => message.starred);
  }

  /**
   * Returns TRUE if all the message divs are mounted
   */
  @computed
  get mountedAllMessages() {
    return (
      this.messages.length === 0 ||
      (this.messages.length > 0 &&
        Object.keys(this.messageElements).length === this.messages.length)
    );
  }

  /**
   * If TRUE, indicates jumped-message-indicator should show up
   */
  @computed
  get showJumpedMessageIndicator() {
    return this.jumpMode && !this.loadedAllRecent;
  }

  // ////////////// //
  //    METHODS     //
  // ////////////// //

  reset() {
    this.jumpMode = false;
    this.loadedAll = false;
    this.loadedAllRecent = false;
    this.loadedInitial = false;
    this.messages = [];
    this.messageElements = {};
    this.messageInEdit = null;
    this.textInEdit = "";
    this.readStatusCache = {};

    this.updateGroupData({
      marked_as_unread: false,
      new_message_line_at: this.lastReadAt
    });
  }

  @action
  updateMessageData = (id, data) => {
    const message = this.getMessageById(id);
    if (message) {
      extendObservable(message, data);
    }
  };

  @action
  updateGroupData(data) {
    const { groupsStore } = this.rootStore;
    const allowedKeys = [
      "unread_messages_count",
      "mentions_count",
      "last_read_at",
      "marked_as_unread",
      "new_message_line_at"
    ];
    const updates = _.pickBy(data, (value, key) => allowedKeys.includes(key));

    // Update group info
    groupsStore.updateGroupData(this.group.id, updates);
  }

  @action
  updateGroupCursor(cursor) {
    const { groupsStore } = this.rootStore;

    this.groupCursor = cursor;

    groupsStore.updateGroupCursor(this.group.id, cursor);
  }

  // Scroll to the bottom of chat div with animation
  scrollToBottom(cb = null, duration = 0, delay = 100) {
    setTimeout(() => {
      animateScroll.scrollToBottom({
        containerId: "chat",
        duration
      });

      setTimeout(() => {
        if (typeof cb === "function") {
          cb();
        }
      }, duration || 300);
    }, delay);
  }

  // Scroll to specific message in chat div instantly
  scrollTo(messageId, duration = 1000, cb, offset = -50) {
    scroller.scrollTo(`message_${messageId}`, {
      containerId: "chat",
      smooth: true,
      duration,
      offset
    });

    setTimeout(() => {
      if (typeof cb === "function") {
        cb();
      }
    }, duration + 1);
  }

  scrollToNewBanner = () => {
    // If unread messages remain, scroll to top,
    // otherwise just scroll to new banner
    if (this.unreadMessagesCount > this.messages.length) {
      this.scrollTo(this.messages[this.messages.length - 1].id, 500);
    } else if (this.firstUnreadMessage) {
      scroller.scrollTo("newMessageBanner", {
        containerId: "chat",
        smooth: true,
        duration: 500,
        offset: -50
      });
    }
  };

  /**
   * Scroll to a specific message in chat div
   *
   * @param {Integer} messageId ID of message to scroll to
   */
  centerMessage(messageId) {
    const messageElement = this.messageElements[messageId];

    // If message is not mounted yet, return
    if (!messageElement) {
      return;
    }

    // Scroll only when message is not visible
    const offset =
      (this.chatDiv.offsetHeight - messageElement.div.offsetHeight) / 2;

    this.scrollTo(messageId, 0, null, -offset);

    // Highlight the message jumped to by fading out for 3 seconds
    this.highlightMessage(messageId);
  }

  @action
  highlightMessage = (id, duration = 3000) => {
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }

    // required for animation restart
    this.highlightId = null;
    setTimeout(() => {
      this.highlightId = id;
    }, 0);

    this.highlightTimeout = setTimeout(() => {
      this.highlightId = null;
    }, duration);
  };

  /**
   * Jump to the specific message
   * The workflow is as following:
   *  1. Ensures that joined the group which target message belongs to.
   *    1.1. If already joined the target group, goes to Step 2.
   *    1.2. If not joined, waits until joined. Switching group is triggered by URL change.
   *      1.2.1. When joined the target group, goes to Step 2.
   *  2. Ensures that target message is mounted.
   *    2.1. If target message is mounted already, goes to Step 3.
   *    2.2. If not, keeps loading the old messages from server until target message is met.
   *      2.2.1. When target message is mounted, goes to Step 3.
   *  3. Scroll to the target message element
   *
   * @param {Object} targetMessage
   */
  @action
  jumpToMessage(targetMessage) {
    // check if target message is already loaded
    const msg = this.getMessageById(targetMessage.id);
    if (msg) {
      this.centerMessage(msg.id);
      return;
    }

    if (this.joinedTargetGroupDisposer) {
      this.joinedTargetGroupDisposer();
    }

    // Ensure that joined the group to which target message belongs
    this.joinedTargetGroupDisposer = when(
      () => targetMessage.group_id === this.group.id && this.loadedInitial,
      () => {
        // Ensure that target message is mounted
        if (this.mountedTargetMessageDisposer) {
          this.mountedTargetMessageDisposer();
        }

        this.mountedTargetMessageDisposer = when(
          () => this.loadedAround.get(targetMessage.id),
          () => {
            this.centerMessage(targetMessage.id);
          }
        );

        // Load until target message is loaded
        this.loadJumpedMessage(targetMessage);
      }
    );
  }

  /**
   * Load messages around targetMessage
   *
   * @param {Object} targetMessage
   */
  loadJumpedMessage(targetMessage) {
    // temporarily move messages
    this.messageTemp = this.messages.slice(0);
    this.messages = [targetMessage];
    this.loadedAround.set(targetMessage.id, false);
    this.loadedAll = false;
    this.loadedAllRecent = false;
    this.jumpMode = true;
    this.messageInEdit = null;
    this.textInEdit = "";

    // load messages around it
    Promise.all([
      this.loadPastMessages(false),
      this.loadRecentMessages(false)
    ]).then(() => {
      this.loadedAround.set(targetMessage.id, true);
    });
  }

  switchFromJumpMode() {
    this.messages = this.messageTemp.slice(0);
    this.jumpMode = false;
    this.scrollToBottom();
  }

  /**
   * Registers chat div
   *
   * @param {DOMElement} div
   */
  loadChatDiv(div) {
    this.chatDiv = div;
  }

  /**
   * Unregisters chat div
   *
   */
  unloadChatDiv() {
    this.chatDiv = null;
  }

  @action
  markAsUnread = messageId => {
    this.groupChannel.push("mark_as_unread", {
      group_id: this.group.id,
      message_id: messageId
    });
  };

  /**
   * Mark group messages as read
   *
   * @param resetNewMessageLine   IF True, reset newMessageLineAt to null, thus making it depend on lastReadAt,
   *                              Otherwise, store the current lastReadAt timestamp at as newMessageLineAt
   */
  @action
  markAsRead = (resetNewMessageLine = true) => {
    // Set the unread messages info in optimistic
    //
    // last_read_at: lastest message's timestamp + 1ms
    // unread_messages_count: 0
    // mentions_count: 0
    //
    // These info will be updated with real value when `marked_as_read` event is broadcast
    this.updateGroupData({
      last_read_at: moment
        .utc(this.messages.length ? this.messages[0].inserted_at : new Date())
        .add(1, "millisecond")
        .format("YYYY-MM-DDTHH:mm:ss.SSS"),
      unread_messages_count: 0,
      mentions_count: 0
    });

    if (resetNewMessageLine) {
      this.updateGroupData({ new_message_line_at: this.lastReadAt });
    }

    this.groupChannel.push("mark_as_read", { group_id: this.group.id });
  };

  sendMessage = (text, additionalFields = {}) => {
    const tempMessage = this.generateTempMessage(text);
    // Add temp message
    this.messages.unshift(tempMessage);
    // Scroll to bottom
    this.scrollToBottom(null, 0, 0);

    const newMsg = {
      text_content: text,
      request_id: tempMessage.id,
      ...additionalFields
    };

    if (this.syncedTime) {
      newMsg.timestamp = new Date().getTime(); // sending unix timestamp in milliseconds to calc latency on server
    }

    this.groupChannel
      .push("new_msg", newMsg)
      .receive("error", () => {
        this.updateMessageData(tempMessage.id, {
          status: "failed"
        });
      })
      .receive("timeout", () => {
        this.updateMessageData(tempMessage.id, {
          status: "failed"
        });
      });

    this.startTyping.flush(); // flushing throttle
  };

  @action
  deleteLinkPreview = (messageId, link) => {
    return new Promise((resolve, reject) => {
      this.groupChannel
        .push("delete_msg_link_preview", {
          message_id: messageId,
          link
        })
        .receive("ok", resolve)
        .receive("error", err => {
          notify.show(err.message, "error");
          reject(err);
        });
    });
  };

  @action
  loadPastUnreadMessages = () => {
    this.loadPastMessages().then(this.scrollToNewBanner);
  };

  @action
  loadPastMessages = (stayScroll = true) => {
    return new Promise((resolve, reject) => {
      if (this.loadedAll || !this.messages.length || !this.loadedInitial) {
        resolve();
        return;
      }
      this.isLoadingPast = true;
      this.groupChannel
        .push("feed", { max_id: this.messages[this.messages.length - 1].id })
        .receive("ok", data => {
          const { messages } = data;
          this.isLoadingPast = false;

          if (!messages.length) {
            this.loadedAll = true;
            resolve();
            return;
          }

          if (messages.length < 30) {
            this.loadedAll = true;
          }

          this.messages.push(...messages);

          if (stayScroll) {
            when(
              () => !this.isLoadingPast,
              () => {
                setTimeout(() => {
                  this.scrollTo(messages[0].id, 0, () => {
                    resolve();
                  });
                }, 100);
              }
            );
          } else {
            resolve();
          }
        })
        .receive("error", err => {
          this.isLoadingPast = false;
          reject(err);
          notify.show(err.message, "error");
        });
    });
  };

  @action
  loadRecentMessages = (stayScroll = true) => {
    return new Promise((resolve, reject) => {
      if (this.loadedAllRecent || this.isLoadingRecent) {
        resolve();
        return;
      }

      this.isLoadingRecent = true;

      this.groupChannel
        .push("feed_recent", { min_id: this.messages[0].id })
        .receive("ok", data => {
          const { messages } = data;
          this.isLoadingRecent = false;
          if (!messages.length) {
            this.jumpMode = false;
            this.loadedAllRecent = true;
            resolve();
            return;
          }

          if (messages.length < 30) {
            this.loadedAllRecent = true;
          }

          this.messages.unshift(...messages.reverse());

          if (stayScroll) {
            when(
              () => this.mountedAllMessages,
              () => {
                // stay at the position
                this.scrollTo(messages[messages.length - 1].id, 0, () => {
                  resolve();
                });
              }
            );
          } else {
            resolve();
          }
        })
        .receive("error", err => {
          this.isLoadingRecent = false;
          reject(err);
          notify.show(err.message, "error");
        });
    });
  };

  handleInitialLoading = () => {
    this.scrollToBottom(() => {
      this.loadedInitial = true;
      this.updateGroupCursor(null);
    });
  };

  @action
  startEdit(id) {
    const message = this.getMessageById(id);

    if (message) {
      this.messageInEdit = message;
      this.textInEdit = message.text_content;
    }
  }

  @action
  editLastMessage() {
    const message = this.messages.find(m => m.user_id === currentUser.id);

    if (message && message.sent !== false && !message.sending) {
      this.messageInEdit = message;
      this.textInEdit = message.text_content;
    }
  }

  @action
  editText(text) {
    if (!this.messageInEdit) {
      return;
    }

    this.textInEdit = text;
  }

  @action
  finishEdit() {
    if (!this.messageInEdit) {
      return;
    }

    if (
      !this.textInEdit ||
      this.messageInEdit.text_content === this.textInEdit
    ) {
      this.cancelEdit();
      return;
    }

    this.groupChannel.push("edit_msg", {
      message_id: this.messageInEdit.id,
      params: {
        text_content: this.textInEdit
      }
    });
  }

  @action
  cancelEdit() {
    this.messageInEdit = null;
    this.textInEdit = "";
  }

  @action
  delete(id) {
    const message = this.getMessageById(id);

    if (message) {
      this.groupChannel.push("delete_msg", { message_id: id });
    }
  }

  @action
  toggleStar(id) {
    const message = this.getMessageById(id);

    if (message) {
      post(`/api/v1/messages/${id}/toggle-star`);
    }
  }

  @action
  togglePin(id) {
    const message = this.getMessageById(id);

    if (message) {
      post(`/api/v1/messages/${id}/toggle-pin`);
    }
  }

  startTyping = _.throttle(() => {
    clearTimeout(this.typingTimeoutId);
    this.groupChannel.push("typing_started");
  }, START_TYPING_THROTTLE_MS);

  keepScrollAtBottom = () => {
    if (this.isScrollBottom) {
      this.scrollToBottom();
    }
  };

  generateTempMessage = text => {
    // generates unique temporary request ID
    const tempId = shortid.generate();

    return {
      // Temp attributes
      id: tempId,
      status: "sending",
      inserted_at: moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS"),

      user: currentUser,
      type: "chat",
      text_content: text,
      group_id: this.group.id,
      user_id: currentUser.id
    };
  };

  @action
  toggleReaction = (messageId, emoji) => {
    this.groupChannel.push("toggle_reaction", {
      message_id: messageId,
      emoji_name: emoji
    });
  };

  @action
  syncTime = () => {
    this.syncedTime = false;
    this.groupChannel
      .push("sync_time", {
        timestamp: new Date().getTime()
      })
      .receive("ok", () => {
        this.syncedTime = true;
      });
  };

  // ////////////// //
  // EVENT HANDLERS //
  // ////////////// //

  @action
  onJoinGroupChannel = data => {
    // sync time as soon as joined to the channel
    this.syncTime();

    if (this.group.id === this.loadedGroupId) {
      // new message has more precedance by putting it as first param.
      this.messages = _.unionBy(data.messages, this.messages, msg => {
        return msg.request_id || msg.id; // if temporary message, merge by request_id. Otherwise, merge by msg id
      });
    } else {
      this.messages = data.messages;
    }

    this.rootStore.socketStore.sendPingWithTimeout();

    if (data.messages.length < 30) {
      this.loadedAll = true;
    }

    this.loadedGroupId = this.group.id;

    when(() => this.mountedAllMessages, this.handleInitialLoading);
  };

  /**
   * Registers message div when message component is mounted
   *
   * @param {Integer} messageId
   * @param {DOMElement} messageDiv
   */
  onMessageMounted(messageId, messageDiv) {
    this.messageElements = {
      ...this.messageElements,
      [messageId]: {
        div: messageDiv,
        visible: false
      }
    };
  }

  @action
  onScrollTopReached() {
    this.loadPastMessages();
  }

  @action
  onScrollBottomReached() {
    if (this.jumpMode && !this.loadedAllRecent) {
      this.loadRecentMessages();
    } else {
      this.isScrollBottom = true;
    }
  }

  @action
  onScrollBottomLeft() {
    this.isScrollBottom = false;
  }

  onMessageShow(id) {
    if (this.messageElements[id]) {
      this.messageElements[id].visible = true;
    }

    if (!this.groupCursor || this.groupCursor > id) {
      this.updateGroupCursor(id);
    }

    if (
      !this.markedAsUnread &&
      this.firstUnreadMessage &&
      this.firstUnreadMessage.id === id
    ) {
      // If first unread message is visible, mark messages as read after 1s delay
      // but, leave the new message line
      setTimeout(() => {
        this.markAsRead(false);
      }, 1000);
    }
  }

  onMessageHide(id) {
    if (this.messageElements[id]) {
      this.messageElements[id].visible = false;
    }

    if (!this.groupCursor || this.groupCursor === id) {
      const index = this.messages.findIndex(m => m.id === id);
      if (index > 0) {
        this.updateGroupCursor(this.messages[index - 1].id);
      }
    }
  }

  @action
  onNewMessage = newMessage => {
    const { sidemenuStore, groupStore } = this.rootStore;

    if (newMessage.group_id !== this.group.id) {
      return;
    }

    if (
      this.getMessageById(newMessage.request_id) && // request_id is now attached to every message, so we should check if temp message exists
      newMessage.user_id === currentUser.id
    ) {
      // update message if it's temporary
      this.updateMessageData(newMessage.request_id, {
        ...newMessage,
        read_status: {
          // set read status with cached status
          ...newMessage.read_status,
          ...this.readStatusCache[newMessage.id]
        },
        status: undefined
      });

      // clear read status cache for new message arrived
      if (this.readStatusCache[newMessage.id]) {
        delete this.readStatusCache[newMessage.id];
      }
    } else {
      // otherwise, add to message list
      this.messages.unshift(newMessage);
    }

    // Update unread messages info of the group
    if (newMessage.user_id === currentUser.id) {
      if (this.unreadMessagesCount === 0) {
        this.markAsRead();
      }
    } else if (this.unreadMessagesCount === 0 && this.isScrollBottom) {
      // If you're at the bottom and no NML, keep up with the new message
      this.markAsRead();
    } else if (newMessage.type !== "system") {
      const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

      this.updateGroupData({
        unread_messages_count: this.unreadMessagesCount + 1,
        mentions_count: this.mentionsCount + (isMention ? 1 : 0)
      });
    }

    // If my message or at scroll bottom, scroll to bottom
    if (this.isScrollBottom || newMessage.user_id === currentUser.id) {
      this.scrollToBottom(null, 0, 0);
    }

    // Update favicon
    sidemenuStore.updateFavicon();

    // Play notification audio
    sidemenuStore.playNotificationAudioForNewMessage(newMessage);

    // Show notification card
    sidemenuStore.showNotificationCardForNewMessage(newMessage);

    // Remove the sender of message from typing list immediately after message arrives
    if (newMessage.user_id && newMessage.user_id !== currentUser.id) {
      groupStore.stoppedTyping(newMessage.user_id);
    }
  };

  @action
  onEditMessage = editedMessage => {
    if (editedMessage.group_id !== this.group.id) {
      return;
    }

    this.cancelEdit();

    const message = this.getMessageById(editedMessage.id);

    message.edited = editedMessage.edited;
    message.edited_at = editedMessage.edited_at;
    message.text_content = editedMessage.text_content;
  };

  @action
  onDeleteMessage = deletedMessage => {
    const messageIndex = this.messages.findIndex(
      m => m.id === deletedMessage.id
    );

    if (messageIndex > -1) {
      this.messages.splice(messageIndex, 1);
    }
  };

  @action
  onStarredMessage = message => {
    const { globalStarredMessageStore } = this.rootStore;

    this.updateMessageData(message.id, {
      starred: message.starred
    });

    if (message.starred) {
      globalStarredMessageStore.add(message);
    } else {
      globalStarredMessageStore.remove(message.id);
    }
  };

  @action
  onPinnedMessage = message => {
    const { pinnedMessageStore } = this.rootStore;

    this.updateMessageData(message.id, {
      pinned: message.pinned,
      pinned_at: message.pinned_at,
      pinned_by: message.pinned_by
    });

    if (message.pinned) {
      pinnedMessageStore.add(message);
    } else {
      pinnedMessageStore.remove(message.id);
    }
  };

  @action
  onLinkPreviewGenerated = payload => {
    if (payload.group_id !== this.group.id) {
      return;
    }

    const message = this.getMessageById(payload.id);

    if (message) {
      message.link_previews = payload.link_previews;
      this.keepScrollAtBottom();
    }
  };

  @action
  onLinkPreviewDeleted = payload => {
    const message = this.getMessageById(payload.message_id);

    if (message) {
      message.link_previews = message.link_previews.filter(
        p => p.link !== payload.link
      );
      this.keepScrollAtBottom();
    }
  };

  @action
  onReactionUpdate = payload => {
    const message = this.messages.find(m => m.id === payload.message_id);
    if (message) {
      message.reactions_web = payload.reactions_web;
    }
  };

  @action
  onReadStatusUpdate = payload => {
    if (!payload.messages) return;

    Object.keys(payload.messages).forEach(message_id => {
      const message = this.getMessageById(parseInt(message_id, 10));
      if (message) {
        message.read_status = message.read_status || {};
        Object.assign(message.read_status, payload.messages[message_id]);
      } else {
        // cache read status because this event was broadcasted before new_msg due to network slowness
        this.readStatusCache[message_id] =
          this.readStatusCache[message_id] || {};
        Object.assign(
          this.readStatusCache[message_id],
          payload.messages[message_id]
        );
      }
    });
  };
}

export default MessageStore;
