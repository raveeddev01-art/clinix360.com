import { observable, action, computed } from "mobx";
import moment from "moment";
import { animateScroll } from "react-scroll";

class MessageStore {
  @observable messages = [];

  scrollToBottom = () => {
    animateScroll.scrollToBottom({
      containerId: "chat"
    });
  };

  @computed
  get messagesByDate() {
    const msgMap = {};

    this.messages.forEach(msg => {
      const date = moment(msg.createdAt).format();
      msgMap[date] = msgMap[date] || [];
      msgMap[date].push(msg);
    });

    return msgMap;
  }

  @action
  loadMessages = groupId => {
    // @TODO load messages here
    this.messages = [
      {
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10"
      },
      {
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10"
      },
      {
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10"
      },
      {
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-05-10"
      },
      {
        user: { id: 20, first_name: "John", last_name: "Smith" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-08"
      },
      {
        user: { id: 6, first_name: "Adam", last_name: "Fordham" },
        text:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sit amet congue dui.",
        createdAt: "2017-08-09"
      }
    ];
  };
}

const store = new MessageStore();
export default store;
