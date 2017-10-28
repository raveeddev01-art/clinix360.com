import { observable, action, computed, when } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll, scroller } from "react-scroll";
import Promise from "bluebird";

class MessageStore {
  @observable chatDiv = null; // Div element of chat pane
  @observable messageElements = {}; // Div elements of messages loaded in the chat div
  @observable messages = []; // messages currently loaded
  @observable messageInEdit = null; // Message currently being edited
  @observable textInEdit = ""; // Current text of message in edit
  @observable isScrollBottom = false; // TRUE if reached to the bottom scroll of chat div, otherwise FALSE
  @observable loadedInitial = false; // If TRUE, indicates joined the chat channel and loaded the latest messages
  @observable jumpMode = false; // indicates if message list is currently at jumping mode
  @observable unreadMessagesCount = 0;
  @observable mentionsCount = 0;
  @observable lastReadAt = null;
  @observable newMessageLinePosition = 0;
  @observable groupCursor = null;
  @observable loadedAround = new Map(); // { msg_id: true } indicates if messages around the jumped message is loaded
  @observable isLoadingRecent = false;
  @observable isLoadingPast = false;
  @observable highlightId = null; // message will be highlighted
  @observable markedAsUnread = false;

  messageTemp = null; // when switching to jumpm mode, stores current messages here so that we can restore them when use his `recent messages`
  @observable loadedAll = false; // If TRUE, indicates that there is no more old messages to load from server
  @observable loadedAllRecent = false; // If TRUE, indicates that there is no more recent messages to load from server

  // mobx when() monitor disposers
  joinedTargetGroupDisposer = null; // Disposer of when() monitor that waits until joined the group to which jumping target message belongs to
  mountedTargetMessageDisposer = null; // Disposer of when() monitor that waits until target messages is mounted

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  // ////////////// //
  //    GETTERS     //
  // ////////////// //

  get groupId() {
    return this.rootStore.groupStore.id;
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

  get eventChannel() {
    return this.rootStore.channelStore.eventChannel;
  }

  get groupChannel() {
    return this.rootStore.channelStore.groupChannel;
  }

  @computed
  get firstUnreadMessage() {
    return this.getMessageByIndex(this.unreadMessagesCount - 1);
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
    if (!this.firstUnreadMessage || !this.loadedInitial) {
      return "hidden-up";
    }

    const lastMessageId = this.groupCursor || this.messages[0].id;
    const messageElement = this.messageElements[this.firstUnreadMessage.id];
    if (!messageElement) {
      return "hidden-up";
    }

    if (messageElement.visible) {
      return "visible";
    }

    return this.firstUnreadMessage.id < lastMessageId
      ? "hidden-up"
      : "hidden-down";
  }

  @computed
  get newMessageLineMessage() {
    return this.getMessageByIndex(this.newMessageLinePosition - 1);
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
    this.markedAsUnread = false;
    this.messages = [];
    this.messageElements = {};
    this.messageInEdit = null;
    this.textInEdit = "";
  }

  getMessageByIndex(index) {
    if (index < 0 || index > this.messages.length - 1) {
      return null;
    }

    return this.messages[index];
  }

  @action
  updateGroupCursor(cursor) {
    const { sidemenuStore } = this.rootStore;

    this.groupCursor = cursor;
    sidemenuStore.updateGroupCursor(this.groupId, cursor);
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
        duration: 500,
        offset: -40
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
      this.updateGroupCursor(null);
    }
  }

  @action
  onScrollBottomLeft() {
    this.isScrollBottom = false;
  }

  onMessageHide(id) {
    if (this.messageElements[id]) {
      this.messageElements[id].visible = false;
    }

    if (!this.loadedInitial || this.isScrollBottom) {
      return;
    }

    if (!this.groupCursor || this.groupCursor === id) {
      const index = this.messages.findIndex(m => m.id === id);
      if (index > 0) {
        this.updateGroupCursor(this.messages[index - 1].id);
      }
    }
  }

  onMessageShow(id) {
    if (this.messageElements[id]) {
      this.messageElements[id].visible = true;
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

    if (!this.loadedInitial) {
      return;
    }

    if (!this.groupCursor || this.groupCursor > id) {
      this.updateGroupCursor(id);
    }
  }

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

    this.highlightId = id;
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
    if (this.joinedTargetGroupDisposer) {
      this.joinedTargetGroupDisposer();
    }

    // Ensure that joined the group to which target message belongs
    this.joinedTargetGroupDisposer = when(
      () => targetMessage.group_id === this.groupId && this.loadedInitial,
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
    this.messageElements = {
      ...this.messageElements,
      [messageId]: {
        div: messageDiv,
        visible: false
      }
    };
  }

  @action
  updateUnreadMessagesInfo(data) {
    const { groupStore, sidemenuStore } = this.rootStore;
    const allowedKeys = [
      "unread_messages_count",
      "mentions_count",
      "last_read_at"
    ];
    const updates = _.pickBy(data, (value, key) => allowedKeys.includes(key));
    const camelCasedUpdates = _.mapKeys(updates, (value, key) =>
      _.camelCase(key)
    );

    // Update message store
    Object.assign(this, camelCasedUpdates);

    // Update group store
    groupStore.update(camelCasedUpdates);

    // Update sidemenu store
    sidemenuStore.updateGroupData(this.groupId, updates);
  }

  @action
  updateUnreadMessages(updates) {
    const countToUpdate = Math.min(updates.length, this.unreadMessagesCount);
    const processedUpdates = _.orderBy(
      updates,
      ["inserted_at"],
      ["desc"]
    ).slice(0, countToUpdate);

    processedUpdates.forEach((update, index) => {
      Object.assign(this.messages[index], { read_status: update.read_status });
    });
  }

  markAsUnread = messageId => {
    this.groupChannel
      .push("mark_as_unread", { group_id: this.groupId, message_id: messageId })
      .receive("ok", response => {
        this.updateUnreadMessagesInfo(response);
        this.updateUnreadMessages(response.messages);

        this.markedAsUnread = true;
        this.newMessageLinePosition = this.unreadMessagesCount;
      })
      .receive("error", err => {
        notify.show(err.message, "error");
      });
  };

  /**
   * Mark group messages as read
   *
   * @param resetNewMessageLine   IF True, reset lastReadtAt to current timestamp, causing `New Message Line` to disappear
   */
  @action
  markAsRead = (resetNewMessageLine = true) => {
    const { groupStore, sidemenuStore } = this.rootStore;

    if (groupStore.loading) {
      // should not mark as read when in transition to other group
      return;
    }

    this.groupChannel
      .push("mark_as_read", { group_id: this.groupId })
      .receive("ok", () => {
        this.updateUnreadMessagesInfo({
          unread_messages_count: 0,
          mentions_count: 0,
          last_read_at: new Date()
        });

        if (resetNewMessageLine) {
          this.newMessageLinePosition = 0;
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

  @action
  onNewMessage = newMessage => {
    const { sidemenuStore } = this.rootStore;

    if (newMessage.group_id !== this.groupId) {
      return;
    }

    this.messages.unshift(newMessage);

    if (newMessage.user_id === currentUser.id) {
      if (this.unreadMessagesCount === 0) {
        this.markAsRead();
      }
      this.newMessageLinePosition = 0;
    } else {
      const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

      // For messages from other users
      if (this.newMessageLinePosition || !this.isScrollBottom) {
        this.newMessageLinePosition = this.newMessageLinePosition + 1;
      }

      if (this.unreadMessagesCount || !this.isScrollBottom) {
        this.updateUnreadMessagesInfo({
          unread_messages_count: this.unreadMessagesCount + 1,
          mentions_count: this.mentionsCount + (isMention ? 1 : 0)
        });
      } else {
        this.markAsRead(false);
      }
    }

    if (this.isScrollBottom || newMessage.user_id === currentUser.id) {
      this.scrollToBottom(() => {}, 100);
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
    if (editedMessage.group_id !== this.groupId) {
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
    this.messages = data.messages;

    if (data.messages.length < 30) {
      this.loadedAll = true;
    }

    const { groupStore } = this.rootStore;

    this.unreadMessagesCount = groupStore.unreadMessagesCount;
    this.mentionsCount = groupStore.mentionsCount;
    this.lastReadAt = groupStore.lastReadAt;
    this.newMessageLinePosition = this.unreadMessagesCount;

    when(() => this.mountedAllMessages, this.handleInitialLoading);
  };

  handleInitialLoading = () => {
    const { sidemenuStore } = this.rootStore;
    let posHistory = null;

    if (this.unreadMessagesCount) {
      this.scrollToBottom(() => {
        this.updateGroupCursor(null);
        this.loadedInitial = true;
      }, 0);
    } else {
      this.groupCursor = sidemenuStore.groupCursors[this.groupId];
      posHistory = this.groupCursor;

      if (posHistory && this.messages.find(m => m.id === posHistory)) {
        // A.1.a
        this.scrollTo(
          posHistory,
          0,
          () => {
            this.loadedInitial = true;
          },
          -10
        );
      } else {
        // A.1.b, A.2.a
        this.scrollToBottom(() => {
          this.updateGroupCursor(null);
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
  editLastMessage() {
    const message = this.messages.find(m => m.user_id === currentUser.id);
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
      post(`/api/v1/messages/${id}/toggle-pin`).then(resp => {
        const pinnedMsg = resp.data;

        message.pinned = pinnedMsg.pinned;
        message.pinned_at = pinnedMsg.pinned_at;
        message.pinned_by = pinnedMsg.pinned_by;

        if (pinnedMsg.pinned) {
          this.rootStore.pinnedMessageStore.messages.push(pinnedMsg);
        } else {
          this.rootStore.pinnedMessageStore.messages = this.rootStore.pinnedMessageStore.messages.filter(
            m => m.id !== pinnedMsg.id
          );
        }
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

  keepScrollAtBottom() {
    if (this.isScrollBottom) {
      this.scrollToBottom();
    }
  }
}

export default MessageStore;
