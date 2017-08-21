import { observable, action, computed } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll } from "react-scroll";

class MessageStore {
  @observable messages = [];
  @observable messageInEdit = null;
  @observable textInEdit = "";
  @observable canLoad = false;
  loadedAll = false;
  channel = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  scrollToBottom() {
    animateScroll.scrollToBottom({
      containerId: "chat"
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
  };

  sendMessage = msg => {
    return new Promise((resolve, reject) => {
      this.channel
        .push("new_msg", { text_content: msg })
        .receive("ok", resolve)
        .receive("error", err => {
          window.notify.show(err.message, "error");
          reject(err);
        });
    });
  };

  @action
  loadPastMessages = () => {
    if (!this.canLoad || this.loadedAll) {
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
      this.scrollToBottom();
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

    put(`/api/v1/messages/${this.messageInEdit.id}`, {
      body: {
        message: {
          text_content: this.textInEdit
        }
      }
    }).then(resp => {
      const { data } = resp;

      // TODO: Update `updated` and `updated_at` from response
      this.messageInEdit.updated = true; // data.text_content
      this.messageInEdit.updated_at = new Date(); // data.updated_at
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
  toggleStar(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
      post(`/api/v1/messages/${id}/toggle-star`).then(resp => {
        const update = resp.data;

        message.starred = update.starred;
      });
    }
  }

  @action
  togglePin(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
      post(`/api/v1/messages/${id}/toggle-pin`).then(resp => {
        const update = resp.data;

        message.pinned = update.pinned;
        message.pinned_at = update.pinned_at;
        message.pinned_by = update.pinned_by;
      });
    }
  }
}

export default MessageStore;
