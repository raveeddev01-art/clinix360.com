import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import _ from "lodash";

class TeamFileStore {
  @observable file = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  load(encodedFileId, fn) {
    get(`/api/v1/files/${encodedFileId}`).then(response => {
      this.file = response.data
      fn(this.file)
    });
  }
}

export default TeamFileStore;
