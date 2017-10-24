import { observable, computed, action } from "mobx";
import queryString from "query-string";

class PinnedMessageStore {
  @observable messages = [];
  @observable loading = false;
  @observable hasMore = true;
  skip = 0;
  limit = 10;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get groupId() {
    return this.rootStore.groupStore.id;
  }

  @computed
  get isEmpty() {
    return this.messages.length === 0;
  }

  @action
  reset() {
    this.skip = 0;
    this.loading = false;
    this.hasMore = true;
    this.messages = [];
    this.loadMore();
  }

  @action
  loadMore() {
    if (this.loading || !this.hasMore) {
      return;
    }

    const params = queryString.stringify({
      skip: this.skip,
      limit: this.limit,
      group_id: this.groupId
    });

    this.loading = true;

    get(`/api/v1/pinned_messages?${params}`).then(response => {
      this.loading = false;

      const { data, meta } = response.data;

      this.messages = this.messages.concat(data);
      this.hasMore = this.messages.length < meta.count;
      this.skip = meta.skip + meta.limit;
    });
  }
}

export default PinnedMessageStore;
