import { observable, action, computed, autorun } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll } from "react-scroll";

class MessageStore {
  @observable chatDiv = null;
  @observable messages = [];
  @observable messageDivs = {};
  @observable messageInEdit = null;
  @observable textInEdit = "";
  @observable canLoad = false;
  @observable loadedInitial = false;
  @observable isScrollBottom = false;
  @observable mountedAllMessages = false;
  loadedAll = false;

  constructor(rootStore) {
    this.rootStore = rootStore;

    autorun(() => {
      // If group slug changes, join to messages channel of group
      if (this.rootStore.groupStore.slug) {
        this.joinGroupChannel();
      }
    });
  }

  scrollToBottom(duration = 1000, cb = null) {
    animateScroll.scrollToBottom({
      containerId: "chat",
      duration
    });

    setTimeout(() => {
      if (typeof cb === "function") {
        cb();
      }
    }, duration);
  }

  loadChatDiv(div) {
    this.chatDiv = div;
  }

  onMessageMounted(messageId, messageDiv) {
    console.log("onMessageMounted");
    this.messageDivs[messageId] = messageDiv;

    if (Object.keys(this.messageDivs).length === this.messages.length) {
      this.mountedAllMessages = true;
    }
  }

  unloadChatDiv() {
    this.chatDiv = null;
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

  joinGroupChannel = () => {
    this.mountedAllMessages = false;
    this.loadedAll = false;
    this.messages = [];
    this.messageDivs = {};

    this.rootStore.channelStore
      .joinGroupChannel()
      .receive("ok", this.loadMessages)
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
  loadPastMessages = () => {
    if (!this.canLoad || this.loadedAll || !this.messages.length) {
      return;
    }

    this.canLoad = false;

    this.groupChannel
      .push("feed", { max_id: this.messages[this.messages.length - 1].id })
      .receive("ok", this.addPastMessages)
      .receive("error", err => {
        notify.show(err.message, "error");
      });
  };

  @action
  addPastMessages = data => {
    if (!data.messages.length) {
      this.loadedAll = true;
      return;
    }

    this.messages.push(...data.messages);
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
      setTimeout(() => {
        this.scrollToBottom();
      }, 300);
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
  loadMessages = data => {
    this.messages = data.messages;

    setTimeout(() => {
      this.scrollToBottom(1000, () => {
        this.loadedInitial = true;
      });
    }, 300);
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
