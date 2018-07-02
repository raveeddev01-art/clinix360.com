import { observable, computed, action } from "mobx";
import { stringify } from "qs";
import _ from "lodash";

class TeamFileStore {
  @observable file = {};
  @observable fileShareModalId = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.fileShareModalId = undefined;
  }

  @action
  createPublicLink() {
    post(`/api/v1/files/${this.file.id}/create_public_link`).then(response => {
      this.file = { ...this.file, ...response.data };
    });
  }

  @action
  revokePublicLink() {
    post(`/api/v1/files/${this.file.id}/revoke_public_link`).then(response => {
      this.file = { ...this.file, ...response.data };
    });
  }

  @action
  deleteComment(commentId) {
    remove(`/api/v1/file_comments/${commentId}`).then(response => {
      const comments = _.filter(this.file.comments, c => c.id !== commentId);
      this.file.comments = comments;
    });
  }

  @action
  updateComment(commentId, commentText) {
    const body = { file_comment: { text_content: commentText } };
    return put(`/api/v1/file_comments/${commentId}`, {
      body
    }).then(response => {
      this.file.comments = this.file.comments.map(
        comment => (comment.id === commentId ? response.data : comment)
      );
    });
  }

  @action
  deleteFile() {
    return remove(`/api/v1/files/${this.file.id}`);
  }

  @action
  onFileUpdate(upload) {
    this.file = upload;
  }

  @action
  addComment(text) {
    const body = { file_comment: { text_content: text } };
    return post(`/api/v1/files/${this.file.id}/comments`, { body });
  }

  @action
  load(encodedFileId) {
    return get(`/api/v1/files/${encodedFileId}`).then(response => {
      this.file = response.data;
    });
  }

  @action
  share(groupId) {
    const body = { group_id: groupId };
    return post(`/api/v1/files/${this.file.id}/share`, { body });
  }

  @action
  unshare(groupId) {
    const body = { group_id: groupId };
    return post(`/api/v1/files/${this.file.id}/unshare`, {
      body
    }).then(response => {
      this.file = response.data;
    });
  }

  @action
  openShareModal(fileId) {
    get(`/api/v1/files/${fileId}`).then(response => {
      this.file = response.data;
      this.fileShareModalId = fileId;
    });
  }

  @action
  onFileCommentAdded = file => {
    if (file.id === this.file.id) {
      this.file = file;
    }
  };

  @action
  onFileCommentEdited = file => {
    if (file.id === this.file.id) {
      this.file = file;
    }
  };
}

export default TeamFileStore;
