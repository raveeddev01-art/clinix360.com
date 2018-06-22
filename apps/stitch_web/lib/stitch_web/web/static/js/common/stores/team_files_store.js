import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import _ from "lodash";

class TeamFilesStore {
  @observable files = [];
  // @observable loading = false;
  // @observable hasMore = true;
  // limit = 100;
  // limit = 3;
  @observable params = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.params = {
      skip: 0,
      limit: 3,
      creator_id: undefined,
      filetype: undefined,
      meta: {}
    };
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

  @action
  search(options = {}) {
    _.merge(this.params, options);
    let params = this.serialize(this.params)
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
