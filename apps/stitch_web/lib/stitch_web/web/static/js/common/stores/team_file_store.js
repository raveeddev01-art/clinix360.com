import { observable, action } from "mobx";
import uniqBy from "lodash/uniqBy";
import { confirmModal, readonlyInputModal } from "common/modals";

class TeamFileStore {
  @observable file = {};
  @observable fileShareModalId = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.fileShareModalId = undefined;
  }

  @action
  createPublicLink = fileId => {
    post(`/api/v1/files/${fileId || this.file.id}/create_public_link`, {
      hideNotify: true
    }).then(response => {
      this.file = { ...this.file, ...response.data };

      readonlyInputModal({
        title: "Public Link to This File",
        message: response.data.public_url,
        okLabel: "Done",
        cancelLabel: "Revoke"
      }).catch(() => {
        this.revokePublicLink(this.file.id, true);
      });
    });
  };

  @action
  revokePublicLink = (fileId, askConfirm = true) => {
    let promise = Promise.resolve();
    if (askConfirm) {
      promise = confirmModal({
        title: "Revoke Public File Link",
        message:
          "This will disable the Public Link for this file. This will cause any previously shared links to stop working.\n\nAre you sure you want to revoke this public link?",
        okLabel: "Revoke It"
      });
    }

    promise
      .then(() => {
        post(
          `/api/v1/files/${fileId || this.file.id}/revoke_public_link`
        ).then(response => {
          this.file = { ...this.file, ...response.data };
        });
      })
      .catch(() => {
        // do nothing since it's just from confirm modal
      });
  };

  @action
  deleteComment = commentId => {
    remove(`/api/v1/file_comments/${commentId}`).then(() => {
      const comments = this.file.comments.filter(c => c.id !== commentId);
      this.file.comments = comments;
    });
  };

  @action
  updateComment = (commentId, commentText) => {
    const body = { file_comment: { text_content: commentText } };
    return put(`/api/v1/file_comments/${commentId}`, {
      body,
      hideNotify: true
    }).then(response => {
      this.file.comments = this.file.comments.map(
        comment => (comment.id === commentId ? response.data : comment)
      );
    });
  };

  @action
  deleteFile = fileId => {
    confirmModal({
      title: "Delete File",
      message:
        "Are you sure you want to delete this file? This cannot be undone.",
      okLabel: "Delete"
    })
      .then(() => {
        return remove(`/api/v1/files/${fileId || this.file.id}`);
      })
      .then(() => {
        this.rootStore.addonStore.toggleAddons("files");
      });
  };

  @action
  onFileUpdate(upload) {
    this.file = upload;
  }

  @action
  addComment(text) {
    const body = { file_comment: { text_content: text } };
    return post(`/api/v1/files/${this.file.id}/comments`, {
      body,
      hideNotify: true
    }).then(response => {
      this.file.comments = uniqBy([...this.file.comments, response.data], "id");
    });
  }

  @action
  load(encodedFileId) {
    return get(`/api/v1/files/${encodedFileId}`).then(response => {
      this.file = response.data;
      return this.file;
    });
  }

  @action
  share = (groupId, textContent) => {
    const body = { group_id: groupId, text_content: textContent };
    return post(`/api/v1/files/${this.file.id}/share`, {
      body,
      hideNotify: true
    }).then(response => {
      this.file = response.data;
    });
  };

  @action
  unshare = groupId => {
    const body = { group_id: groupId };
    return post(`/api/v1/files/${this.file.id}/unshare`, {
      body,
      hideNotify: true
    }).then(response => {
      this.file = response.data;
    });
  };

  @action
  openShareModal = fileId => {
    get(`/api/v1/files/${fileId}`).then(response => {
      this.file = response.data;
      this.fileShareModalId = fileId;
    });
  };

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
