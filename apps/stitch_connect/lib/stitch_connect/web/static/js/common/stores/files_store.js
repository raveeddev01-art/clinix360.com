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
    if (!this.hasMore) {
      return;
    }

    const params = queryString.stringify({
      skip: this.files.length,
      limit: this.limit
    });

    get(`/api/v1/uploads?${params}`).then(response => {
      console.log("files", response);

      const { data, meta } = response.data;

      this.files = this.files.concat(data);
      this.hasMore = meta.count === meta.limit;
    });
  }
}

export default FilesStore;
