import { observable, action, computed, when } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll, scroller } from "react-scroll";
import Promise from "bluebird";

class MessageStore {
  @observable chatDiv = null; // Div element of chat pane
  @observable messageDivs = {}; // Div elements of messages loaded in the chat div
  @observable messages = []; // messages currently loaded
  @observable messageInEdit = null; // Message currently being edited
  @observable textInEdit = ""; // Current text of message in edit
  @observable isScrollBottom = false; // TRUE if reached to the bottom scroll of chat div, otherwise FALSE
  @observable loadedInitial = false; // If TRUE, indicates joined the chat channel and loaded the latest messages
  @observable jumpMode = false; // indicates if message list is currently at jumping mode
  @observable unreadMessagesCount = 0;
  @observable mentionsCount = 0;
  @observable lastReadAt = null;
  @observable loadedAround = new Map(); // { msg_id: true } indicates if messages around the jumped message is loaded
  @observable isLoadingRecent = false;
  @observable isLoadingPast = false;

  messageTemp = null; // when switching to jumpm mode, stores current messages here so that we can restore them when use his `recent messages`
  @observable loadedAll = false; // If TRUE, indicates that there is no more old messages to load from server
  @observable loadedAllRecent = false; // If TRUE, indicates that there is no more recent messages to load from server
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
    return this.jumpMode && !this.loadedAllRecent;
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

    const lastIndex = _.findLastIndex(this.messages, message => {
      const messageInsertedAt = moment.utc(message.inserted_at).valueOf();

      return messageInsertedAt > lastReadAt;
    });

    return lastIndex >= this.unreadMessagesCount - 1
      ? this.messages[lastIndex]
      : null;
  }

  @computed
  get firstUnreadMessageVisibility() {
    if (!this.firstUnreadMessage) {
      return "hidden-up";
    }

    return this.getElementVisibility(
      this.messageDivs[this.firstUnreadMessage.id]
    );
  }

  @computed
  get messagesByDate() {
    return (
      _.chain(this.messages)
        .sortBy("inserted_at")
        // Group messages by dates
        .groupBy(message => moment(message.inserted_at).format(`YYYY-MM-DD`))
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
    this.jumpMode = false;
    this.loadedAll = false;
    this.loadedAllRecent = false;
    this.loadedInitial = false;
    this.messages = [];
    this.messageDivs = {};
    this.messageInEdit = null;
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

  /**
   * Returns the position of element in chat div
   * 
   * Possible return values are:
   *  'hidden-up': message is hidden in up the chat div
   *  'visible': message is visible
   *  'hidden-down': message is hidden in down the chat div
   */
  getElementVisibility(element) {
    if (!element) {
      return "hidden-up";
    }

    const chatDivBoundingRect = this.chatDiv.getBoundingClientRect();
    const elementBoundingRect = element.getBoundingClientRect();

    if (elementBoundingRect.top < chatDivBoundingRect.top) {
      return "hidden-up";
    }

    if (elementBoundingRect.bottom > chatDivBoundingRect.bottom) {
      return "hidden-down";
    }

    return "visible";
  }

  // Scroll to specific message in chat div instantly
  scrollTo(msgId, duration = 1000, cb, offset = -50) {
    scroller.scrollTo(`msg_${msgId}`, {
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
    // if there are unread messages remain, scroll to top,
    // otherwise just scroll to new banner
    if (this.unreadMessagesCount > this.messages.length) {
      this.scrollTo(this.messages[this.messages.length - 1].id, 500);
    } else if (this.firstUnreadMessage) {
      scroller.scrollTo("newMessageBanner", {
        containerId: "chat",
        smooth: true,
        duration: 500
      });
    }
  };

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
   */
  centerMessage(messageId) {
    const messageDiv = this.messageDivs[messageId];

    // If message is not mounted yet, return
    if (!messageDiv) {
      return;
    }

    // Scroll only when message is not visible
    const offset = (this.chatDiv.offsetHeight - messageDiv.offsetHeight) / 2;

    this.scrollTo(messageId, 0, null, -offset);

    // Highlight the message jumped to by fading out for 3 seconds
    $(messageDiv).fadeTo(0, 0.5).fadeTo(3000, 1);
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
    this.loadPastMessages().then(this.scrollToNewBanner);
  };

  @action
  loadPastMessages = (stayScroll = true) => {
    return new Promise((resolve, reject) => {
      if (this.loadedAll || !this.messages.length) {
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

  @action
  onNewMessage = newMessage => {
    const { sidemenuStore, groupStore } = this.rootStore;

    if (newMessage.group_id !== groupStore.id) {
      return;
    }

    this.messages.unshift(newMessage);

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
    }

    if (this.isScrollBottom || newMessage.user_id === currentUser.id) {
      this.scrollToBottom(() => {}, 0);
    }

    // Update favicon
    sidemenuStore.updateFavicon();

    // Play notification audio
    sidemenuStore.playNotificationAudioForNewMessage(newMessage);

    // Show notification card
    sidemenuStore.showNotificationCardForNewMessage(newMessage);
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
        posHistory =
          this.messages[this.unreadMessagesCount] &&
          this.messages[this.unreadMessagesCount].id; // B.1.a
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

  stopTyping = () => {
    if (this.groupChannel) {
      this.groupChannel.push("typing_stopped");
    }
  };

  startTyping = () => {
    clearTimeout(this.typingTimeoutId);
    this.groupChannel.push("typing_started");
    this.typingTimeoutId = setTimeout(this.stopTyping, 5000);
  };
}

export default MessageStore;
