import { observable, action, computed } from "mobx";
import moment from "moment";
import _ from "lodash";
import { animateScroll } from "react-scroll";

class MessageStore {
  @observable messages = [];

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
        .sortBy("createdAt")
        // Group messages by dates
        .groupBy(message => moment(message.createdAt).format(`YYYY-MM-DD`))
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
                moment(lastMessage.createdAt).diff(
                  message.createdAt,
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

  @action
  loadMessages(groupId) {
    // @TODO load messages here
    this.messages = [
      {
        id: 1,
        starred: true,
        pinned: false,
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10T03:02:10"
      },
      {
        id: 2,
        starred: true,
        pinned: true,
        pinnedBy: { id: 20, first_name: "John", last_name: "Smith" },
        pinnedAt: "2017-08-01T10:10:10",
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10T10:10:10"
      },
      {
        id: 3,
        starred: false,
        pinned: false,
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10T10:20:30"
      },
      {
        id: 4,
        starred: false,
        pinned: false,
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10T10:30:30"
      },
      {
        id: 5,
        starred: false,
        pinned: true,
        pinnedBy: { id: 20, first_name: "John", last_name: "Smith" },
        pinnedAt: "2017-08-09T10:10:10",
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-08T20:10:30"
      },
      {
        id: 6,
        starred: false,
        pinned: false,
        user: { id: 6, first_name: "Adam", last_name: "Fordham" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-09T10:10:10"
      },
      {
        id: 7,
        starred: true,
        pinned: false,
        user: { id: 6, first_name: "Adam", last_name: "Fordham" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-09T10:20:10"
      },
      {
        id: 8,
        starred: false,
        pinned: true,
        pinnedBy: { id: 6, first_name: "Adam", last_name: "Fordham" },
        pinnedAt: "2017-08-10T10:10:10",
        user: { id: 6, first_name: "Adam", last_name: "Fordham" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-09T10:21:10"
      },
      {
        id: 9,
        starred: false,
        user: { id: 6, first_name: "Adam", last_name: "Fordham" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-09T10:31:10"
      }
    ];

    setTimeout(() => {
      this.scrollToBottom();
    }, 300);
  }

  @action
  toggleStar(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
      message.starred = !message.starred;
    }
  }

  @action
  togglePin(id) {
    const message = this.messages.find(m => m.id === id);

    if (message) {
      message.pinned = !message.pinned;

      if (message.pinned) {
        message.pinnedAt = new Date();
        message.pinnedBy = window.currentUser;
      } else {
        message.pinnedAt = null;
        message.pinnedBy = null;
      }
    }
  }
}

export default MessageStore;
