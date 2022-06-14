import { observable, action } from "mobx";
import Guid from "guid";
import xss from "xss";
import { alert } from "common/modals";
import { MAX_FILE_UPLOAD_SIZE } from "lib/constants";

class UploadStore {
  @observable uploadProgress = new Map();
  @observable fileNames = new Map();
  @observable title = "";
  @observable description = "";
  @observable groupId = null;
  @observable conversationId = null;
  @observable isUploadModalVisible = false;
  @observable from = "connect";
  @observable commentUpload = false;
  @observable messageId = null;
  xhrs = {};
  dropzoneRef = null;
  file = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  openFileDialog = (isComment) => {
    this.commentUpload = isComment;
    if (this.commentUpload) {
      this.messageId = this.rootStore.messageStore.message.id;
    }

    if (this.dropzoneRef) {
      this.dropzoneRef.open();
    }
  };

  @action
  openUploadModal = (files, fileName, from = "connect") => {
    this.files = files;
    this.title = files.map(file => file.name).join(", ");  /*fileName || file.name;*/
    this.description = "";
    this.isUploadModalVisible = true;
    this.from = from;

    if (from === "engage") {
      this.conversationId = this.rootStore.inboxStore.currentConversationId;
      this.groupId = null;
    } else {
      this.conversationId = null;
      this.groupId = this.rootStore.groupStore.group.id;
    }
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

  alertLargeFile = file => {
    return alert({
      title: "File upload is too large",
      message: `Sorry, your file <strong>${xss(
        file.name
      )}</strong> is too large to upload.<br><br>Try uploading a smaller file instead.`,
      okLabel: "OK"
    });
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
    if (file.size > MAX_FILE_UPLOAD_SIZE) {
      this.alertLargeFile(file);
      return Promise.reject();
    }

    return post(`${this.rootStore.apiBasePath}/upload-signature`, {
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
            this.alertLargeFile(file).then(() => {
              setTimeout(() => {
                this.removeProgress(key);
              }, 1000);
            });
          } else {
            // Otherwise, show generic message
            notify.show("There was a problem uploading file", "error");
          }

          throw e;
        });
    });
  };

  @action
  uploadFiles = apiUrl => {
    const { files } = this;
    let promises = [];

    for (let file of files) {
      promises.push(this.uploadFile(file));
    }

    Promise.all(promises)
      .then((results) => {
        const fields = results.filter((result) => result);
        if (fields.length) {
          return post(`${this.rootStore.apiBasePath}${apiUrl}`, {
            body: this.uploadBody(fields)
          });
        }
      }) 
  }

  @action
  uploadFile = (file) => {
    const title = file.name;
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
        this.removeProgress(key);
        return {
          filename: title,
          mimetype: file.type,
          size_in_bytes: file.size,
          url
        };
      })
      .catch(e => {
        if (e === "aborted") {
          setTimeout(() => {
            this.removeProgress(key);
          }, 1000); // show cancelling for a blink
        }
        return false;
      });
  };

  // @action
  // uploadFile = apiUrl => {
  //   const { file, title, description } = this;
  //   const filenameSplit = file.name.split(".");
  //   const ext = filenameSplit.length
  //     ? `.${filenameSplit[filenameSplit.length - 1]}`
  //     : "";
  //   const key = `${Guid.create()}${ext}`;

  //   return this.uploadAWS(file, file.type, key, {
  //     onBeforeUpload: () => {
  //       this.uploadProgress.set(key, 0);
  //       this.fileNames.set(key, title);
  //     },
  //     onProgress: (...args) => this.onProgress(key)(...args)
  //   })
  //     .then(url => {
  //       this.uploadProgress.set(key, "done");
  //       return post(`${this.rootStore.apiBasePath}${apiUrl}`, {
  //         body: this.uploadBody(url)
  //       });
  //     })
  //     .then(() => {
  //       this.removeProgress(key);
  //     })
  //     .catch(e => {
  //       if (e === "aborted") {
  //         setTimeout(() => {
  //           this.removeProgress(key);
  //         }, 1000); // show cancelling for a blink
  //       }
  //     });
  // };

  uploadBody = (fileFields) => {
    const { file, title, description, commentUpload } = this;
    if (this.commentUpload) {
      return {
        message_comment: {
          type: "upload",
          fields: fileFields,
          text_content: description,
          thread: true
        }
      }
    } else {
      return {
        message: {
          type: "upload",
          fields: fileFields,
          text_content: description
        }
      };
    }

  }

  @action
  removeProgress = key => {
    this.uploadProgress.delete(key);
    this.fileNames.delete(key);
    this.messageId = null;
    this.commentUpload = false;
  };

  onProgress = key =>
    action(evt => {
      if (evt.lengthComputable) {
        this.uploadProgress.set(key, evt.loaded / evt.total * 100);
      }
    });
}

export default UploadStore;
