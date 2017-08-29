import { observable, action } from "mobx";

class SearchStore {
  @observable messages = [];
  @observable total = 0;
  @observable loading = false;

  @action
  reset = () => {
    this.messages = [];
  };

  @action
  searchMessages = query => {
    this.loading = true;
    return post(`/api/v1/messages/search`, {
      body: { term: query }
    }).then(result => {
      this.total = result.data.length;
      this.loading = false;
      this.messages = result.data;
    });
  };

  @action
  searchMentions = () => this.searchMessages(`@${currentUser.username}`);
}

export default SearchStore;
