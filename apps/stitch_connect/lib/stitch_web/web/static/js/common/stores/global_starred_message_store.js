import { observable, action } from "mobx";

class GlobalStarredMessageStore {
  @observable starredMessages = [];
  @observable loading = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadStarredMessages = () => {
    this.loading = true;
    get("/api/v1/starred_messages").then(response => {
      this.loading = false;
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
