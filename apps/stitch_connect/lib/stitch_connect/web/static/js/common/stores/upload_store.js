import { observable, action } from "mobx";
import Guid from "guid";

class UploadStore {
  @observable uploadProgress = new Map();
  @observable fileNames = new Map();
  @observable title = "";
  @observable description = "";
  @observable groupId = null;
  @observable isUploadModalVisible = false;
  xhrs = {};
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
  openUploadModal = (file, fileName) => {
    this.file = file;
    this.title = fileName || file.name;
    this.description = "";
    this.isUploadModalVisible = true;
    this.groupId = this.rootStore.groupStore.group.id;
  };

  @action
  changeUploadGroup = groupId => {
    this.groupId = groupId;
  };

  @action
  abortUpload = key => {
    if (this.xhrs[key]) {
      this.xhrs[key].abort();
    }
  };

  /**
   * @param {File|String} file
   * @param {String} type e.g image/jpeg
   * @param {String} key aws file key
   * @param {Function} options.onBeforeUpload
   * @param {Function} options.onProgress
   */
  @action
  uploadAWS = (file, type, key, options = {}) => {
    return post("/api/v1/upload-signature", {
      body: {
        filename: key,
        mimetype: type
      }
    }).then(resp => {
      const { data } = resp;
      const formData = new FormData();
      formData.append("AWSAccessKeyId", data.AWSAccessKeyId);
      formData.append("key", data.key);
      formData.append("Content-Type", data["Content-Type"]);
      formData.append("acl", data.acl);
      formData.append("success_action_status", data.success_action_status);
      formData.append("policy", data.policy);
      formData.append("signature", data.signature);
      formData.append("x-amz-server-side-encryption", "AES256");
      formData.append("file", file);

      if (options.onBeforeUpload) {
        options.onBeforeUpload(data);
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        this.xhrs[data.key] = xhr;

        xhr.open("post", data.action);
        xhr.onload = e => {
          if (e.target.status >= 200 && e.target.status < 400) {
            resolve(e.target.responseText);
          } else {
            reject(e.target.responseText);
          }
        };
        xhr.onerror = reject;
        xhr.onabort = () => reject("aborted");
        if (xhr.upload && options.onProgress) {
          xhr.upload.onprogress = options.onProgress;
        }
        xhr.send(formData);
      })
        .then(() => {
          delete this.xhrs[data.key];
          return `${data.action}/${data.key}`;
        })
        .catch(e => {
          if (e === "aborted") {
            throw e;
          }
          // e is a XML document
          const errorDoc = new window.DOMParser().parseFromString(
            e,
            "text/xml"
          );
          const errorCode = errorDoc.documentElement.getElementsByTagName(
            "Code"
          );
          if (
            errorCode.length === 1 &&
            errorCode[0].textContent === "EntityTooLarge"
          ) {
            // We know the error code, show relevant message
            notify.show("Your file is larger than the allowed size.", "error");

            setTimeout(() => {
              this.removeProgress(key);
            }, 5000);
          } else {
            // Otherwise, show generic message
            notify.show("There was a problem uploading file", "error");
          }

          throw e;
        });
    });
  };

  @action
  uploadFile = () => {
    const { file, title, description } = this;
    const filenameSplit = file.name.split(".");
    const ext = filenameSplit.length
      ? `.${filenameSplit[filenameSplit.length - 1]}`
      : "";
    const key = `${Guid.create()}${ext}`;

    return this.uploadAWS(file, file.type, key, {
      onBeforeUpload: () => {
        this.uploadProgress.set(key, 0);
        this.fileNames.set(key, title);
      },
      onProgress: (...args) => this.onProgress(key)(...args)
    })
      .then(url => {
        this.uploadProgress.set(key, "done");
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
      })
      .catch(e => {
        if (e === "aborted") {
          setTimeout(() => {
            this.removeProgress(key);
          }, 1000); // show cancelling for a blink
        }
      });
  };

  @action
  removeProgress = key => {
    this.uploadProgress.delete(key);
    this.fileNames.delete(key);
  };

  onProgress = key =>
    action(evt => {
      if (evt.lengthComputable) {
        this.uploadProgress.set(key, evt.loaded / evt.total * 100);
      }
    });
}

export default UploadStore;
