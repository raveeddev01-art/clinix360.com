import { observable, action } from "mobx";

class GlobalStarredMessageStore {
  @observable starredMessages = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadStarredMessages = () => {
    get("/api/v1/starred_messages").then(response => {
      this.starredMessages = response.data;
    });
  };

  @action
  add = message => {
    this.starredMessages.unshift(message);
  };

  @action
  remove = id => {
    const index = this.starredMessages.findIndex(m => m.id === id);

    if (index > -1) {
      this.starredMessages.splice(index, 1);
    }
  };
}

export default GlobalStarredMessageStore;
