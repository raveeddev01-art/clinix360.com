import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class MentionsStore {
  @observable mentions = [];
  @observable loading = false;
  @observable hasMore = true;

  constructor(rootStore) {
    this.rootStore = rootStore;

    this.limit = 10;
  }

  @computed
  get isEmpty() {
    return this.mentions.length === 0;
  }

  @action
  loadMore() {
    if (this.loading || !this.hasMore) {
      return;
    }

    const params = stringify({
      skip: this.mentions.length,
      limit: this.limit
    });

    this.loading = true;

    get(`/api/v1/mentions?${params}`).then(response => {
      this.loading = false;

      const { data, meta } = response.data;

      this.mentions = this.mentions.concat(data);
      this.hasMore = this.mentions.length < meta.count;
    });
  }
}

export default MentionsStore;
