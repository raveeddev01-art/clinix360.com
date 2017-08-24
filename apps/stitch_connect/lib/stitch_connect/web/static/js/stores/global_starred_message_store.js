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
}

export default GlobalStarredMessageStore;
