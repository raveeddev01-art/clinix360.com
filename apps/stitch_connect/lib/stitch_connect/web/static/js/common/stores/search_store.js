import { observable, action } from "mobx";

class SearchStore {
  @observable messages = [];
  @observable total = 0;
  @observable loading = false;
  @observable skip = 0;
  @observable hasMore = false;
  limit = 10;
  query = "";

  @action
  reset = () => {
    this.messages = [];
    this.skip = 0;
  };

  @action
  searchMessages = query => {
    if (this.loading) {
      return null;
    }

    this.loading = true;
    if (query) {
      this.hasMore = true;
      this.query = query;
      this.skip = 0;
      this.messages = [];
    }

    return post(`/api/v1/messages/search`, {
      body: { term: this.query, skip: this.skip, limit: this.limit }
    }).then(result => {
      this.skip += this.limit;
      if (result.data.length === this.limit) {
        this.hasMore = true;
      } else {
        this.hasMore = false;
      }

      this.loading = false;
      this.messages.push(...result.data);
    });
  };
}

export default SearchStore;
