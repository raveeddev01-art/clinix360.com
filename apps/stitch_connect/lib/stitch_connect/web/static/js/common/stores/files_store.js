import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class FilesStore {
  @observable files = [];
  @observable loading = false;
  @observable hasMore = true;
  @observable showTeamFiles = false;
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
      if (this.showTeamFiles) {
        this.loadMore(true);
      } else {
        this.loadMore();
      }
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
  loadMore(showTeamFiles) {
    if (this.loading || !this.hasMore) {
      return;
    }

    const teamParams = stringify({
      skip: this.files.length,
      limit: this.limit
    });

    const groupParams = stringify({
      skip: this.files.length,
      limit: this.limit,
      group_id: this.groupId
    });

    const params = showTeamFiles ? teamParams : groupParams;

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
