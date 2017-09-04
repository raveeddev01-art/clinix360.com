import { observable, action, computed, when } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll, scroller } from "react-scroll";

class MessageStore {
  @observable chatDiv = null;
  @observable messages = [];
  @observable messageDivs = {};
  @observable messageInEdit = null;
  @observable textInEdit = "";
  @observable isScrollBottom = false;
  @observable loadedInitial = false;
  loadedAll = false;
  messagePositions = {}; // { group: message_id }

  // mobx when() disposers
  joinedTargetGroupDisposer = null;
  loadedTargetMessageDisposer = null;

  get groupTopic() {
    return this.rootStore.groupStore.channelTopic;
  }

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

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
      }, duration);
    }, delay);
  }

  isVisibleInChat(element) {
    const chatDivBoundingRect = this.chatDiv.getBoundingClientRect();
    const elementBoundingRect = element.getBoundingClientRect();

    return (
      elementBoundingRect.top >= chatDivBoundingRect.top &&
      elementBoundingRect.bottom <= chatDivBoundingRect.bottom
    );
  }

  scrollTo(msgId, duration = 1000, cb) {
    scroller.scrollTo(`msg_${msgId}`, {
      containerId: "chat",
      duration
    });

    setTimeout(() => {
      if (typeof cb === "function") {
        cb();
      }
    }, 300);
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
  };

  scrollToMessage(
    message,
    toCenter = true,
    cb = null,
    duration = 300,
    delay = 100
  ) {
    // Scroll to center of chat div

    const messageDiv = this.messageDivs[message.id];

    // If message is not mounted, return
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

    // fade in and fade out the targeted message for 3 seconds
    $(messagePoolDiv).fadeTo(0, 0.5).fadeTo(3000, 1);
  }

  @computed
  get currentGroup() {
    const { groupStore } = this.rootStore;

    return {
      id: groupStore.id
    };
  }

  jumpToMessage(targetMessage) {
    if (this.joinedTargetGroupDisposer) {
      this.joinedTargetGroupDisposer();
    }

    // Ensure that joined the group to which target message belongs
    this.joinedTargetGroupDisposer = when(
      () =>
        targetMessage.group_id === this.currentGroup.id && this.loadedInitial,
      () => {
        // Ensure that target message is loaded
        if (this.loadedTargetMessageDisposer) {
          this.loadedTargetMessageDisposer();
        }

        this.loadedTargetMessageDisposer = when(
          () =>
            this.loadedTargetMessage(targetMessage) && this.mountedAllMessages,
          () => {
            this.scrollToMessage(targetMessage);
          }
        );

        // Load until target message is loaded
        this.loadUntilTargetMessage(targetMessage);
      }
    );
  }

  loadedTargetMessage(targetMessage) {
    return this.messages.findIndex(m => m.id === targetMessage.id) > -1;
  }

  loadUntilTargetMessage(targetMessage) {
    if (this.loadedAll || this.loadedTargetMessage(targetMessage)) {
      return;
    }

    this.loadPastMessages(() => {
      this.loadUntilTargetMessage(targetMessage);
    });
  }

  loadChatDiv(div) {
    this.chatDiv = div;
  }

  unloadChatDiv() {
    this.chatDiv = null;
  }

  onMessageMounted(messageId, messageDiv) {
    this.messageDivs = { ...this.messageDivs, [messageId]: messageDiv };
  }

  @computed
  get mountedAllMessages() {
    return (
      this.messages.length > 0 &&
      Object.keys(this.messageDivs).length === this.messages.length
    );
  }

  get eventChannel() {
    return this.rootStore.channelStore.eventChannel;
  }

  get groupChannel() {
    return this.rootStore.channelStore.groupChannel;
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
              if (_.isEmpty(messagePools)) {
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

  reset() {
    this.loadedAll = false;
    this.loadedInitial = false;
    this.messages = [];
    this.messageDivs = {};
  }

  joinGroupChannel = () => {
    this.rootStore.channelStore
      .joinGroupChannel()
      .receive("ok", this.onJoinGroupChannel)
      .receive("error", err => notify.show(err.message, "error"));

    this.groupChannel.on("new_msg", this.onNewMessage);
    this.groupChannel.on("edit_msg", this.onEditMessage);
    this.groupChannel.on("delete_msg", this.onDeleteMessage);

    this.eventChannel.on("marked_as_read", this.onMarkedAsRead);
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

  markAsRead(id) {
    const message = this.messages.find(m => m.id === id);

    if (message && message.user.id !== currentUser.id && !message.read) {
      this.groupChannel.push("mark_as_read", {
        message_ids: [message.id]
      });
    }
  }

  @action
  onMarkedAsRead = payload => {
    payload.messages.forEach(markedMessage => {
      const message = this.messages.find(m => m.id === markedMessage.id);

      if (message) {
        message.read = true;
        this.rootStore.groupStore.decreaseUnreadMessagesCount();
      }
    });
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

        if (typeof cb === "function") {
          cb();
        }
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

    // Increment unread messages count if it is from other user
    if (newMessage.user_id !== currentUser.id) {
      this.rootStore.groupStore.increaseUnreadMessagesCount();
    }

    this.messages.unshift(newMessage);

    if (this.isScrollBottom || newMessage.user_id === currentUser.id) {
      this.scrollToBottom(() => {}, 0);
    }
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
    this.messages = data.messages;

    when(
      () => this.mountedAllMessages,
      () => {
        const posHistory = this.messagePositions[this.groupTopic];
        if (posHistory && this.messages.find(m => m.id === posHistory)) {
          this.scrollTo(posHistory, 0, () => {
            this.loadedInitial = true;
          });
        } else {
          this.scrollToBottom(() => {
            this.loadedInitial = true;
          }, 0);
        }
      }
    );
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
