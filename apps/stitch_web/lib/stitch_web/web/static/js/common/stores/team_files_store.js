import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import _ from "lodash";

class TeamFilesStore {
  @observable files = [];
  @observable params = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    window.globalstore = this;
    this.params = {
      skip: 0,
      limit: 3,
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
    console.log('filtered: ', filtered)
    return stringify(filtered)
  }

  @computed
  get meta() {
    return stringify(this.params.meta);
  }

  // Viewing files 1,201 to 1,250 of 2,000
  @computed
  get pages() {
    // {"meta":{"skip":0,"limit":3,"count":167}

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
    this.search({ filetype: filetype.value });
  }

  @action
  search(options = {}) {
    console.log('updading params: ', JSON.stringify(options));
    _.merge(this.params, options);
    console.log('new params: ', this.params);
    let params = this.serialize(this.params);
    this.loading = true;

    get(`/api/v1/files?${params}`).then(response => {
      this.loading = false;
      const { data, meta } = response.data;
      this.files = data;
      console.log
      this.params.meta = meta
    });
  }
}

export default TeamFilesStore;
