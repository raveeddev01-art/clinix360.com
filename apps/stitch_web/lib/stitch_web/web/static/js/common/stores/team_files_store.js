import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class TeamFilesStore {
  @observable files = [];
  defaultParams = {
    skip: 0,
    limit: 10
  };
  @observable pageMeta = {};
  @observable currentPage = 1;
  @observable creatorId = undefined;
  @observable fileType = "all";
  @observable pageLimit = 10;

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
  setPage = page => {
    this.currentPage = page;
    this.search();
  };

  @action
  setFileTypeFilter = fileType => {
    this.fileType = fileType;
    this.search();
  };

  @action
  setUserFilter = userId => {
    this.creatorId = userId;
    this.search();
  };

  @action
  search = (options = {}) => {
    const params = stringify({
      ...this.defaultParams,
      ...options,
      creator_id: this.creatorId,
      filetype: this.fileType,
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

export default TeamFilesStore;
