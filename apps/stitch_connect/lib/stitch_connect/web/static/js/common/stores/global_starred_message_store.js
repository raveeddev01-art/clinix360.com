import { observable, action } from "mobx";

class GlobalStarredMessageStore {
  @observable starredMessages = [];

  constructor(rootStore) {
    this.rootStore = rootStore;

    this.loadStarredMessages();
  }

  @action
  loadStarredMessages = () => {
    get("/api/v1/starred_messages").then(response => {
      this.starredMessages = response.data;
    });
  };

  @action
  unshiftStarredMessage = message => {
    this.starredMessages.unshift(message);
  };

  @action
  removeStarredMessage = starredMessage => {
    this.starredMessages = this.starredMessages.filter(
      m => m.id !== starredMessage.id
    );
  };
}

export default GlobalStarredMessageStore;
