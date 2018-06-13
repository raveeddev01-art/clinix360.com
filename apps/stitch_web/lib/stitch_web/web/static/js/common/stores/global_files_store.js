import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class GlobalFilesStore {
  @observable files = [];
  @observable loading = false;
  @observable hasMore = true;
  limit = 10;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.skip = 0;
  }

  @computed
  get isEmpty() {
    return this.files.length === 0;
  }

  @action
  loadMore() {
    if (this.loading || !this.hasMore) {
      return;
    }

    const params = stringify({
      skip: this.files.length,
      limit: this.limit,
      authenticated_urls: true
    });

    this.loading = true;

    get(`/api/v1/uploads?${params}`).then(response => {
      this.loading = false;

      const { data, meta } = response.data;

      this.files = this.files.concat(data);
      this.hasMore = this.files.length < meta.count;
    });
  }
}

export default GlobalFilesStore;
