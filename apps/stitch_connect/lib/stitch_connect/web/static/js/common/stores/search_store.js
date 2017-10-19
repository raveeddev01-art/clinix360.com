import { observable, action, computed } from "mobx";

class SearchStore {
  @observable messages = [];
  @observable loading = false;
  @observable hasMore = false;

  constructor(rootStore) {
    this.rootStore = rootStore;

    this.limit = 10;
    this.query = "";
  }

  @computed
  get isEmpty() {
    return this.messages.length === 0;
  }

  @action
  reset() {
    this.query = "";
    this.messages = [];
    this.loading = false;
    this.hasMore = true;
  }

  @action
  setQuery(query) {
    this.reset();
    this.query = query;
    this.loadMore();
  }

  @action
  loadMore() {
    if (this.loading || !this.hasMore) {
      return;
    }

    this.loading = true;

    post(`/api/v1/messages/search`, {
      body: {
        term: this.query,
        skip: this.messages.length,
        limit: this.limit
      }
    }).then(response => {
      this.loading = false;

      const { data } = response;

      this.messages = this.messages.concat(data);
      this.hasMore = data.length === this.limit;
    });
  }
}

export default SearchStore;
