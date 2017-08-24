import { observable, action, computed } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll } from "react-scroll";

class MessageStore {
  @observable chatDiv = null;
  @observable messages = [];
  @observable messageInEdit = null;
  @observable textInEdit = "";
  @observable canLoad = false;
  @observable loadedInitial = false;
  loadedAll = false;
  channel = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
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

  unloadChatDiv() {
    this.chatDiv = null;
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
                ) >= -30
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

  @action
  joinChannel = channelName => {
    if (this.channel) {
      this.channel.leave();
    }

    this.loadedAll = false;
    this.messages = [];

    this.channel = socket.channel(channelName);
    this.channel
      .join()
      .receive("ok", this.loadMessages)
      .receive("error", err => notify.show(err.message, "error"));

    this.channel.on("new_msg", this.appendMessage);
    this.channel.on("read_msg", this.markAsRead);
  };

  sendMessage = (msg, additionalFields = {}) => {
    return new Promise((resolve, reject) => {
      this.channel
        .push("new_msg", Object.assign({ text_content: msg }, additionalFields))
        .receive("ok", resolve)
        .receive("error", err => {
          notify.show(err.message, "error");
          reject(err);
        });
    });
  };

  readMessage(id) {
    const message = this.messages.find(m => m.id === id);

    if (message && message.user.id !== currentUser.id && !message.read) {
      // TODO: Send `read_msg` channel event
      // this.channel.push("read_msg", { id: message.id });

      // Manually marking the message as read
      this.markAsRead(message);
    }
  }

  @action
  loadPastMessages = () => {
    if (!this.canLoad || this.loadedAll || !this.messages.length) {
      return;
    }

    this.canLoad = false;

    this.channel
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
  appendMessage = data => {
    this.messages.unshift(data);

    setTimeout(() => {
      this.scrollToBottom();
    }, 300);
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
  markAsRead = msg => {
    const message = this.messages.find(m => m.id === msg.id);

    if (message) {
      message.read = true;
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

    window
      .put(`/api/v1/messages/${this.messageInEdit.id}`, {
        body: {
          message: {
            text_content: this.textInEdit
          }
        }
      })
      .then(resp => {
        const { data } = resp;

        this.messageInEdit.edited = data.edited;
        this.messageInEdit.edited_at = data.edited_at;
        this.messageInEdit.text_content = data.text_content;

        this.cancelEdit();
      });
  }

  @action
  cancelEdit() {
    this.messageInEdit = null;
    this.textInEdit = "";
  }

  @action
  delete(id) {
    const messageIndex = this.messages.findIndex(m => m.id === id);

    if (messageIndex > -1) {
      window.remove(`/api/v1/messages/${id}`).then(() => {
        this.messages.splice(messageIndex, 1);
      });
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
