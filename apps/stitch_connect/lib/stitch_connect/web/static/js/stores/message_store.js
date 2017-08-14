import { observable, action, computed } from "mobx";
import moment from "moment";
import { animateScroll } from "react-scroll";

class MessageStore {
  @observable messages = [];
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
    const msgMap = {};

    this.messages.reverse().forEach(msg => {
      const date = moment(msg.inserted_at).format(`YYYY-MM-DD`);
      msgMap[date] = msgMap[date] || [];

      if (!msgMap[date].length) {
        msgMap[date].push([msg]);
      } else {
        const lastMsgPool = msgMap[date][msgMap[date].length - 1];
        const lastMsg = lastMsgPool[lastMsgPool.length - 1];
        if (
          lastMsg.user_id === msg.user_id &&
          moment(lastMsg.inserted_at).diff(msg.inserted_at, "minutes") >= -30
        ) {
          lastMsgPool.push(msg);
        } else {
          msgMap[date].push([msg]);
        }
      }
    });

    return msgMap;
  }

  joinChannel = channelName => {
    if (this.channel) {
      this.channel.leave();
    }

    this.channel = socket.channel(channelName);
    this.channel
      .join()
      .receive("ok", this.loadMessages)
      .receive("error", err => notify.show(err.message, "danger"));
    this.channel.on("new_msg", this.appendMessage);
  };

  sendMessage = msg => {
    return new Promise((resolve, reject) => {
      this.channel
        .push("new_msg", { text_content: msg })
        .receive("ok", resolve)
        .receive("error", err => {
          notify.show(err.message, "danger");
          reject(err);
        });
    });
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
  toggleStar(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
      message.starred = !message.starred;
    }
  }
}

export default MessageStore;
