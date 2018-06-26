import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import _ from "lodash";

class TeamFileStore {
  @observable file = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  createPublicLink() {
    post(`/api/v1/files/${this.file.id}/create_public_link`).then(response => {
      this.file = response.data
    })
  }

  @action
  revokePublicLink() {
    post(`/api/v1/files/${this.file.id}/revoke_public_link`).then(response => {
      this.file = response.data
    })
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

// [info] POST /api/v1/files//create_public_link
// [info] POST /api/v1/files/1407/create_public_link
// [info] POST /files/1407/create_public_link