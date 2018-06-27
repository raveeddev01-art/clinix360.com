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
  deleteComment(commentId) {
    remove(`/api/v1/file_comments/${commentId}`).then(response => {
      let comments = _.filter(this.file.comments, c => c.id != commentId);
      this.file.comments = comments;
    })
  }

  @action
  deleteFile(fn) {
    remove(`/api/v1/files/${this.file.id}`).then(response => {
      fn(response);
    });
  }

  @action
  onFileUpdate(upload) {
    this.file = upload;
  }

  @action
  addComment(text, fn) {
    let body = { file_comment: { text_content: text } };
    post(`/api/v1/files/${this.file.id}/comments`, { body }).then(response => {
      this.file.comments = this.file.comments.concat([response.data]);
      fn(this.file)
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
