import { observable, action } from "mobx";

class UploadStore {
  @observable uploadProgress = {};
  @observable title = "";
  @observable description = "";
  @observable isUploadModalVisible = false;
  dropzoneRef = null;
  file = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  reset = () => {
    this.isUploadModalVisible = false;
    this.file = null;
    this.title = "";
    this.description = "";
  };

  openFileDialog = () => {
    if (this.dropzoneRef) {
      this.dropzoneRef.open();
    }
  };

  openUploadModal = file => {
    this.file = file;
    this.title = file.name;
    this.isUploadModalVisible = true;
  };

  @action
  uploadFile = () => {
    const { file } = this;
    const key = "randomstring";

    return post("/api/v1/uploads-signature", {
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

        this.uploadProgress[key] = 0;

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
            this.uploadProgress[key] = "done";
            return `${data.action}/${data.key}`;
          })
          .catch(() => {
            notify.show("There was a problem uploading file", "error");
          });
      })
      .then(fileName => {});
  };

  @action
  removeProgress = key => {
    delete this.uploadProgress[key];
  };

  onProgress = key =>
    action(evt => {
      if (evt.lengthComputable) {
        this.uploadProgress[key] = evt.loaded / evt.total * 100;
      }
    });
}

export default UploadStore;
