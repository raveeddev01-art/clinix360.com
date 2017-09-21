import { observable, action, computed, when } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll, scroller } from "react-scroll";

class MessageStore {
  @observable chatDiv = null; // Div element of chat pane
  @observable messageDivs = {}; // Div elements of messages loaded in the chat div
  @observable messages = []; // messages currently loaded
  @observable messageInEdit = null; // Message currently being edited
  @observable messageJumpedTo = null; // Message the user jumped to manually
  @observable textInEdit = ""; // Current text of message in edit
  @observable isScrollBottom = false; // TRUE if reached to the bottom scroll of chat div, otherwise FALSE
  @observable loadedInitial = false; // If TRUE, indicates joined the chat channel and loaded the latest messages

  @observable unreadMessagesCount = 0;
  @observable mentionsCount = 0;
  @observable lastReadAt = null;

  loadedAll = false; // If TRUE, indicates that there is no more old messages to load from server
  messagePositions = {}; // { group: message_id }

  // mobx when() monitor disposers
  joinedTargetGroupDisposer = null; // Disposer of when() monitor that waits until joined the group to which jumping target message belongs to
  mountedTargetMessageDisposer = null; // Disposer of when() monitor that waits until target messages is mounted

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // ////////////// //
  //    GETTERS     //
  // ////////////// //

  /**
   * Socket channel topic of currently joined chat group
   */
  get groupTopic() {
    return this.rootStore.groupStore.channelTopic;
  }

  /**
   * Currently joined chat group
   */
  @computed
  get currentGroup() {
    const { groupStore } = this.rootStore;

    return {
      id: groupStore.id
    };
  }

  /**
   * Returns TRUE if all the message divs are mounted
   */
  @computed
  get mountedAllMessages() {
    return (
      this.messages.length > 0 &&
      Object.keys(this.messageDivs).length === this.messages.length
    );
  }

  /**
   * If TRUE, indicates jumped-message-indicator should show up
   */
  @computed
  get showJumpedMessageIndicator() {
    return this.messageJumpedTo && !this.isScrollBottom;
  }

  get eventChannel() {
    return this.rootStore.channelStore.eventChannel;
  }

  get groupChannel() {
    return this.rootStore.channelStore.groupChannel;
  }

  @computed
  get firstUnreadMessage() {
    const lastReadAt = moment.utc(this.lastReadAt).valueOf();

    return _.findLast(this.messages, message => {
      const messageInsertedAt = moment.utc(message.inserted_at).valueOf();

      return messageInsertedAt > lastReadAt;
    });
  }

  @computed
  get messagesByDate() {
    return (
      _.chain(this.messages)
        .sortBy("inserted_at")
        // Group messages by dates
        .groupBy(message => moment(message.inserted_at).format(`YYYY-MM-DD`))
        // Pool sequential messages by the same user
        .transform((messagesByDate, messages, date) => {
          messagesByDate[date] = _.transform(
            messages,
            (messagePools, message) => {
              if (
                _.isEmpty(messagePools) ||
                (this.firstUnreadMessage &&
                  this.firstUnreadMessage.id === message.id)
              ) {
                messagePools.push([message]);
                return;
              }

              const lastMessagePool = _.last(messagePools);
              const lastMessage = _.last(lastMessagePool);

              if (
                lastMessage.user.id === message.user.id &&
                moment(lastMessage.inserted_at).diff(
                  message.inserted_at,
                  "minutes"
                ) >= -30 &&
                message.type === `chat` // it was user_message before
              ) {
                lastMessagePool.push(message);
              } else {
                messagePools.push([message]);
              }
            },
            []
          );
        }, {})
        .value()
    );
  }

  @computed
  get pinnedMessages() {
    return this.messages.filter(message => message.pinned);
  }

  @computed
  get starredMessages() {
    return this.messages.filter(message => message.starred);
  }

  // ////////////// //
  //    METHODS     //
  // ////////////// //

  reset() {
    this.loadedAll = false;
    this.loadedInitial = false;
    this.messages = [];
    this.messageDivs = {};
    this.messageInEdit = null;
    this.messageJumpedTo = null;
    this.textInEdit = "";
  }

  // Scroll to the bottom of chat div with animation
  scrollToBottom(cb = null, duration = 300, delay = 100) {
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

  // Checks if message element is visible in chat
  isVisibleInChat(element) {
    const chatDivBoundingRect = this.chatDiv.getBoundingClientRect();
    const elementBoundingRect = element.getBoundingClientRect();

    return (
      elementBoundingRect.top >= chatDivBoundingRect.top &&
      elementBoundingRect.bottom <= chatDivBoundingRect.bottom
    );
  }

  // Scroll to specific message in chat div instantly
  scrollTo(msgId, duration = 1000, cb) {
    scroller.scrollTo(`msg_${msgId}`, {
      containerId: "chat",
      smooth: true,
      duration
    });

    setTimeout(() => {
      if (typeof cb === "function") {
        cb();
      }
    }, 300);
  }

  scrollToNewBanner = () => {
    if (this.firstUnreadMessage) {
      this.scrollTo(this.firstUnreadMessage.id, 500);
    }
  };

  @action
  onScrollBottomReached() {
    this.isScrollBottom = true;
    this.messageJumpedTo = null;
  }

  @action
  onScrollBottomLeft() {
    this.isScrollBottom = false;
  }

  onInvisibleMessage = id => {
    const currentPos = this.messagePositions[this.groupTopic];
    if (!currentPos || currentPos === id) {
      const index = this.messages.findIndex(m => m.id === id);
      if (this.messages[index - 1]) {
        this.messagePositions[this.groupTopic] = this.messages[index - 1].id;
      }
    }
  };

  onVisibleMessage = id => {
    const currentPos = this.messagePositions[this.groupTopic];
    if (!currentPos || currentPos > id) {
      this.messagePositions[this.groupTopic] = id;
    }

    if (this.firstUnreadMessage && this.firstUnreadMessage.id === id) {
      // If first unread message is visible, mark messages as read after 1s delay
      // but, leave the new message line
      setTimeout(() => {
        this.markAsRead(false);
      }, 1000);
    }
  };

  /**
   * Scroll to a specific message in chat div
   *
   * @param {Integer} messageId ID of message to scroll to
   * @param {Boolean} toCenter IF TRUE, places the message in the center after scrolling
   * @param {Function} cb Callback to run after scrolling ends
   * @param {Integer} duration Duration of scroll animation
   * @param {Integer} delay Delay before starting animation
   */
  scrollToMessage(
    messageId,
    toCenter = true,
    cb = null,
    duration = 300,
    delay = 100
  ) {
    const messageDiv = this.messageDivs[messageId];

    // If message is not mounted yet, return
    if (!messageDiv) {
      return;
    }

    // Find messagePoolDiv
    const messagePoolDiv = $(messageDiv).closest(".message-pool")[0];

    // Scroll only when message is not visible
    if (!this.isVisibleInChat(messagePoolDiv)) {
      const toY = toCenter
        ? Math.max(
            messagePoolDiv.offsetTop -
              (this.chatDiv.offsetHeight - messagePoolDiv.offsetHeight) / 2,
            0
          )
        : messagePoolDiv.offsetTop;

      setTimeout(() => {
        animateScroll.scrollTo(toY, {
          containerId: "chat",
          duration
        });

        setTimeout(() => {
          if (typeof cb === "function") {
            cb();
          }
        }, duration);
      }, delay);
    }

    // Highlight the message jumped to by fading out for 3 seconds
    $(messagePoolDiv).fadeTo(0, 0.5).fadeTo(3000, 1);
  }

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
    if (this.joinedTargetGroupDisposer) {
      this.joinedTargetGroupDisposer();
    }

    // Ensure that joined the group to which target message belongs
    this.joinedTargetGroupDisposer = when(
      () =>
        targetMessage.group_id === this.currentGroup.id && this.loadedInitial,
      () => {
        // Ensure that target message is mounted
        if (this.mountedTargetMessageDisposer) {
          this.mountedTargetMessageDisposer();
        }

        this.mountedTargetMessageDisposer = when(
          () =>
            this.loadedTargetMessage(targetMessage) && this.mountedAllMessages,
          () => {
            this.scrollToMessage(targetMessage.id);
            this.messageJumpedTo = targetMessage;
          }
        );

        // Load until target message is loaded
        this.loadUntilTargetMessage(targetMessage);
      }
    );
  }

  /**
   * Checks if the message is loaded
   *
   * @param {Object} targetMessage
   *
   * @return TRUE if loaded, otherwise FALSE
   */
  loadedTargetMessage(targetMessage) {
    return this.messages.findIndex(m => m.id === targetMessage.id) > -1;
  }

  /**
   * Load old messages until target message is met
   *
   * @param {Object} targetMessage
   */
  loadUntilTargetMessage(targetMessage) {
    if (this.loadedAll || this.loadedTargetMessage(targetMessage)) {
      return;
    }

    this.loadPastMessages(() => {
      this.loadUntilTargetMessage(targetMessage);
    });
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

  /**
   * Registers message div when message component is mounted
   *
   * @param {Integer} messageId
   * @param {DOMElement} messageDiv
   */
  onMessageMounted(messageId, messageDiv) {
    this.messageDivs = { ...this.messageDivs, [messageId]: messageDiv };
  }

  /**
   * Mark group messages as read
   * 
   * @param resetNewMessageLine   IF True, reset lastReadtAt to current timestamp, causing `New Message Line` to disappear
   */
  @action
  markAsRead = (resetNewMessageLine = true) => {
    if (this.rootStore.groupStore.loading) {
      // should not mark as read when in transition to other group
      return;
    }

    this.groupChannel
      .push("mark_as_read", { group_id: this.rootStore.groupStore.id })
      .receive("ok", () => {
        const { groupStore, sidemenuStore } = this.rootStore;

        groupStore.unreadMessagesCount = 0;
        groupStore.mentionsCount = 0;
        sidemenuStore.updateGroupData(groupStore.id, {
          unread_messages_count: 0,
          mentions_count: 0
        });
        this.unreadMessagesCount = 0;

        if (resetNewMessageLine) {
          const now = new Date();

          this.rootStore.groupStore.lastReadAt = now;
          this.rootStore.sidemenuStore.updateGroupData(
            this.rootStore.groupStore.id,
            { last_read_at: now }
          );
          this.lastReadAt = now;
        }

        // Update favicon
        sidemenuStore.updateFavicon();
      })
      .receive("error", err => {
        notify.show(err.message, "error");
      });
  };

  joinGroupChannel = () => {
    this.rootStore.channelStore
      .joinGroupChannel()
      .receive("ok", this.onJoinGroupChannel)
      .receive("error", err => notify.show(err.message, "error"));

    this.groupChannel.on("new_msg", this.onNewMessage);
    this.groupChannel.on("edit_msg", this.onEditMessage);
    this.groupChannel.on("delete_msg", this.onDeleteMessage);
  };

  sendMessage = (msg, additionalFields = {}) => {
    return new Promise((resolve, reject) => {
      this.groupChannel
        .push("new_msg", Object.assign({ text_content: msg }, additionalFields))
        .receive("ok", resolve)
        .receive("error", err => {
          notify.show(err.message, "error");
          reject(err);
        });
    });
  };

  @action
  loadPastUnreadMessages = () => {
    this.loadPastMessages(this.scrollToNewBanner);
  };

  @action
  loadPastMessages = (cb = null) => {
    if (this.loadedAll || !this.messages.length) {
      return;
    }

    this.groupChannel
      .push("feed", { max_id: this.messages[this.messages.length - 1].id })
      .receive("ok", data => {
        const { messages } = data;

        if (!messages.length) {
          this.loadedAll = true;
          return;
        }

        this.messages.push(...messages);

        when(
          () => this.mountedAllMessages,
          () => {
            // stay at the position
            this.scrollTo(messages[0].id, 0, () => {
              if (typeof cb === "function") {
                cb();
              }
            });
          }
        );
      })
      .receive("error", err => {
        notify.show(err.message, "error");
      });
  };

  @action
  onNewMessage = newMessage => {
    if (newMessage.group_id !== this.rootStore.groupStore.id) {
      return;
    }

    this.messages.unshift(newMessage);

    const { sidemenuStore, groupStore, notificationStore } = this.rootStore;

    // 6. New Messages Line
    //  1. new message line should ONLY disappear if You enter a new message
    //
    // In other words, if the user enters messages when messages are marked as read
    // and new mesage line is visible, hide new message line
    if (
      newMessage.user_id === currentUser.id &&
      this.unreadMessagesCount === 0 &&
      this.firstUnreadMessage
    ) {
      const now = new Date();

      groupStore.lastReadAt = now;
      sidemenuStore.updateGroupData(groupStore.id, { last_read_at: now });
      this.lastReadAt = now;
    }

    if (newMessage.user_id !== currentUser.id) {
      const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

      // For messages from other users
      if (this.unreadMessagesCount) {
        this.unreadMessagesCount += 1;

        if (isMention) {
          this.mentionsCount += 1;
        }

        sidemenuStore.updateGroupData(groupStore.id, {
          unread_messages_count: this.unreadMessagesCount,
          mentions_count: this.mentionsCount
        });
      } else if (!this.isScrollBottom) {
        this.unreadMessagesCount += 1;

        if (isMention) {
          this.mentionsCount += 1;
        }

        sidemenuStore.updateGroupData(groupStore.id, {
          unread_messages_count: this.unreadMessagesCount,
          mentions_count: this.mentionsCount
        });
      } else {
        this.markAsRead();
      }

      // Play sound notification
      const desktopNotification = notificationStore.getGroupNotificationPreference(
        groupStore.id
      );

      if (desktopNotification === "everything") {
        // Play sound
        console.log("play sound");
      } else if (desktopNotification === "mentions" && isMention) {
        // Play sound
        console.log("play sound");
      }
    }

    if (this.isScrollBottom || newMessage.user_id === currentUser.id) {
      this.scrollToBottom(() => {}, 0);
    }

    // Update favicon
    sidemenuStore.updateFavicon();
  };

  @action
  onEditMessage = editedMessage => {
    if (editedMessage.group_id !== this.rootStore.groupStore.id) {
      return;
    }

    this.cancelEdit();

    const message = this.messages.find(m => m.id === editedMessage.id);

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
  onJoinGroupChannel = data => {
    const { groupStore } = this.rootStore;

    this.unreadMessagesCount = groupStore.unreadMessagesCount;
    this.mentionsCount = groupStore.mentionsCount;
    this.lastReadAt = groupStore.lastReadAt;

    this.messages = data.messages;

    when(() => this.mountedAllMessages, this.handleInitialLoading);
  };

  /**
   * Conversation Loading/Unreads/New Messages
   * A. When you enter or load a conversation with no unread messages...
   *    1. If the user hasn't loaded past 30 then...
   *      a. Start user at the PREVIOUS place they were in the conversation (Instant) OR
   *      b. Start user at bottom (Instant)
   *    2. If the user has loaded a conversation more than 30 messages (e.g. another 60), then...
   *      a. Start user at the bottom. (Instant)
   * B. When you enter or load a conversation with unread messages...
   *    1. If oldest unread message is within limit (e.g. 30)
   *      a. Start user at where they left off (at the oldest unread message). Autoscroll Target Top from the bottom. (Animation)
   *      b. Mark all messages in the conversation as read
   *    2. If oldest unread message is beyond rendered message limit (e.g. 30 messages)...
   *      a. take user so target message is at top of viewport and show thin blue bar with # of unread messages. (Animation)
   *        i. Don't mark messages as read
   * NOTE B.2.b logic inside ./chat/message-panel.jsx
   *      b. Clicking this thin blue bar OR trying to scroll past rendered message list...
   *        i. autoscrolls to oldest unread message. (Animation)
   *        ii. Marks all messages in the conversation as read
   */
  handleInitialLoading = () => {
    let posHistory = null;
    if (this.unreadMessagesCount) {
      this.messagePositions[this.groupTopic] = null;
      if (this.unreadMessagesCount >= 30) {
        posHistory = this.messages[this.messages.length - 1].id; // B.2.a
        this.scrollToBottom(() => {
          this.scrollTo(posHistory, 500, () => {
            this.loadedInitial = true; // B.2.a.i
          });
        }, 0);
      } else {
        posHistory = this.messages[this.unreadMessagesCount].id; // B.1.a
        this.scrollToBottom(() => {
          this.loadedInitial = true; // B.1.b
          this.scrollTo(posHistory, 500);
          this.markAsRead();
        }, 0);
      }
    } else {
      posHistory = this.messagePositions[this.groupTopic];
      if (posHistory && this.messages.find(m => m.id === posHistory)) {
        // A.1.a
        this.scrollTo(posHistory, 0, () => {
          this.loadedInitial = true;
        });
      } else {
        this.messagePositions[this.groupTopic] = null;
        // A.1.b, A.2.a
        this.scrollToBottom(() => {
          this.loadedInitial = true;
        }, 0);
      }
    }
  };

  @action
  startEdit(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
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
    const message = this.messages.find(m => m.id === id);

    if (message) {
      this.groupChannel.push("delete_msg", { message_id: id });
    }
  }

  @action
  toggleStar(id) {
    const message = this.messages.find(m => m.id === id);
    const globalStarredMessageStore = this.rootStore.globalStarredMessageStore;

    if (message) {
      window.post(`/api/v1/messages/${id}/toggle-star`).then(resp => {
        const update = resp.data;

        message.starred = update.starred;

        if (message.starred) {
          globalStarredMessageStore.unshiftStarredMessage(message);
        } else {
          globalStarredMessageStore.removeStarredMessage(message);
        }
      });
    }
  }

  @action
  togglePin(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
      window.post(`/api/v1/messages/${id}/toggle-pin`).then(resp => {
        const update = resp.data;

        message.pinned = update.pinned;
        message.pinned_at = update.pinned_at;
        message.pinned_by = update.pinned_by;
      });
    }
  }
}

export default MessageStore;
