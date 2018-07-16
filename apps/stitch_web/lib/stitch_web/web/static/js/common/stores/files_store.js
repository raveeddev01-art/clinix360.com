import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class FilesStore {
  @observable loading = false;
  @observable collapsed = false;
  @observable files = [];
  @observable pageMeta = {};
  @observable currentPage = 1;
  @observable creatorId = undefined;
  @observable fileType = "all";
  @observable pageLimit = 10;
  defaultParams = {
    skip: 0,
    limit: 10
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get pages() {
    const meta = this.pageMeta;
    const count = meta.count || 0;
    const currentPage = Math.floor(meta.skip / meta.limit) + 1;
    return { count, currentPage, limit: meta.limit || this.pageLimit };
  }

  @action
  reset() {
    this.currentPage = 1;
    this.loading = false;
    this.files = [];
    this.pageMeta = {};

    if (this.collapsed) {
      this.search();
    }
  }

  @action
  onCollapseChange = collapsed => {
    this.collapsed = collapsed;
    if (collapsed && this.files.length === 0) {
      this.setPage(1);
    }
  };

  @computed
  get groupId() {
    return this.rootStore.groupStore.group.id;
  }

  @action
  setPage = page => {
    this.currentPage = page;
    this.search();
  };

  @action
  search = (options = {}) => {
    this.loading = true;

    const params = stringify({
      ...this.defaultParams,
      ...options,
      filetype: "all",
      group_id: this.groupId,
      skip: (this.currentPage - 1) * this.pageLimit,
      limit: this.pageLimit
    });

    this.loading = true;

    get(`/api/v1/files?${params}`).then(response => {
      this.loading = false;
      const { data, meta } = response.data;
      this.files = data;
      this.pageMeta = meta;
    });
  };
}

export default FilesStore;
