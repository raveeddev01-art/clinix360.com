import { observable, action } from "mobx";
import Guid from "guid";

class UploadStore {
  @observable uploadProgress = new Map();
  @observable title = "";
  @observable description = "";
  @observable groupId = null;
  @observable isUploadModalVisible = false;
  dropzoneRef = null;
  file = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  openFileDialog = () => {
    if (this.dropzoneRef) {
      this.dropzoneRef.open();
    }
  };

  @action
  openUploadModal = file => {
    this.file = file;
    this.title = file.name;
    this.description = "";
    this.isUploadModalVisible = true;
    this.groupId = this.rootStore.groupStore.id;
  };

  @action
  changeUploadGroup = groupId => {
    this.groupId = groupId;
  };

  @action
  uploadFile = () => {
    const { file, title, description } = this;
    const filenameSplit = file.name.split(".");
    const ext = filenameSplit.length
      ? `.${filenameSplit[filenameSplit.length - 1]}`
      : "";
    const key = `${Guid.create()}${ext}`;

    return post("/api/v1/upload-signature", {
      body: {
        filename: key,
        mimetype: file.type
      }
    })
      .then(resp => {
        const { data } = resp;
        const formData = new FormData();
        formData.append("AWSAccessKeyId", data.AWSAccessKeyId);
        formData.append("key", data.key);
        formData.append("Content-Type", data["Content-Type"]);
        formData.append("acl", data.acl);
        formData.append("success_action_status", data.success_action_status);
        formData.append("policy", data.policy);
        formData.append("signature", data.signature);
        formData.append("file", file);

        this.uploadProgress.set(key, 0);

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("post", data.action);
          xhr.onload = e => resolve(e.target.responseText);
          xhr.onerror = reject;
          if (xhr.upload) {
            xhr.upload.onprogress = this.onProgress(key);
          }
          xhr.send(formData);
        })
          .then(() => {
            this.uploadProgress.set(key, "done");
            return `${data.action}/${data.key}`;
          })
          .catch(() => {
            notify.show("There was a problem uploading file", "error");
          });
      })
      .then(url => {
        return post(`/api/v1/groups/${this.groupId}/messages`, {
          body: {
            message: {
              type: "upload",
              fields: {
                filename: title,
                mimetype: file.type,
                size_in_bytes: file.size,
                url
              },
              text_content: description
            }
          }
        });
      })
      .then(() => {
        this.removeProgress(key);
      });
  };

  @action
  removeProgress = key => {
    this.uploadProgress.delete(key);
  };

  onProgress = key =>
    action(evt => {
      if (evt.lengthComputable) {
        this.uploadProgress.set(key, evt.loaded / evt.total * 100);
      }
    });
}

export default UploadStore;
