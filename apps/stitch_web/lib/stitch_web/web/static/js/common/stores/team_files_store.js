import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import _ from "lodash";

class TeamFilesStore {
  @observable files = [];
  @observable params = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.params = {
      skip: 0,
      limit: 50,
      creator_id: undefined,
      filetype: "all",
      meta: {}
    };
    this.filetypes = [
      { name: "All Files Types", value: "all" },
      { name: "Images", value: "images" },
      { name: "PDFs", value: "pdf" },
      { name: "Videos", value: "videos" },
      { name: "Audio", value: "audio" },
      { name: "Text", value: "text" },
      { name: "Archive", value: "archive" },
    ]
  }

  serialize(params) {
    const filtered = _.pickBy(params, (value, key) => value != undefined);
    return stringify(filtered)
  }

  @computed
  get pageInfo() {
    let { skip, limit, count } = this.params.meta
    return { from: skip + 1, to: skip + limit, count }
  }

  @computed
  get pages() {
    let meta = this.params.meta;
    let totalPages = Math.ceil(meta.count / meta.limit);
    let currentPage = Math.ceil(meta.skip / meta.limit);
    return { totalPages, currentPage };
  }

  @action
  goToPage(page) {
    this.search({ skip: page * this.params.limit });
  }

  @action
  filterByFiletype(filetypeId) {
    const filetype = this.filetypes[filetypeId];
    this.search({ filetype: filetype.value, skip: 0 });
  }

  @action
  search(options = {}) {
    _.merge(this.params, options);

    let params = this.serialize(this.params);
    this.loading = true;

    get(`/api/v1/files?${params}`).then(response => {
      this.loading = false;
      const { data, meta } = response.data;
      this.files = data;
      this.params.meta = meta
    });
  }
}

export default TeamFilesStore;
