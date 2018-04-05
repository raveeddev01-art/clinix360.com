import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class FilesStore {
  @observable files = [];
  @observable loading = false;
  @observable hasMore = true;
  skip = 0;
  limit = 10;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  reset() {
    this.skip = 0;
    this.loading = false;
    this.hasMore = true;
    this.files = [];

    if (this.collapsed) {
      this.loadMore();
    }
  }

  @action
  onCollapse = collapsed => {
    this.collapsed = collapsed;
    if (collapsed && this.files.length === 0 && this.hasMore) {
      this.loadMore();
    }
  };

  @computed
  get groupId() {
    return this.rootStore.groupStore.group.id;
  }

  @computed
  get isEmpty() {
    return this.files.length === 0;
  }

  @action
  loadMore(allfiles) {
    if (this.loading || !this.hasMore) {
      return;
    }

    const teamparams = stringify({
      skip: this.files.length,
      limit: this.limit,
      group_id: this.groupId
    });

    const roomparams = stringify({
      skip: this.files.length,
      limit: this.limit,
      group_id: this.groupId
    });

    const test = allfiles ? teamparams : roomparams;

    this.loading = true;

    get(`/api/v1/uploads?${test}`).then(response => {
      this.loading = false;

      const { data, meta } = response.data;

      this.files = this.files.concat(data);
      this.hasMore = this.files.length < meta.count;
    });
  }
}

export default FilesStore;
