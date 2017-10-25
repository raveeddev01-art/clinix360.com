import { observable, computed, action } from "mobx";
import queryString from "query-string";

class FilesStore {
  @observable files = [];
  @observable loading = false;
  @observable hasMore = true;

  constructor(rootStore) {
    this.rootStore = rootStore;

    this.limit = 10;
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

    const params = queryString.stringify({
      skip: this.files.length,
      limit: this.limit
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

export default FilesStore;
