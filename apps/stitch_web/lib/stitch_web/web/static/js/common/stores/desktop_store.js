import { observable, action } from "mobx";

// @TODO move over badge related stuff over to this store
// {
//   id: 1,
//   mimetype: "image/png",
//   filename: "Siberian-Husky-water-walking-blue-900x506.jpg",
//   savePath: "~/Desktop/Siberian-Husky-water-walking-blue-900x506.jpg",
//   status: 'progress'
// }
/**
 * This store contains all communication with desktop app
 */
class DesktopStore {
  @observable files = [];
  @observable highlightId = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.electronEnv = window.electronEnv;
    this.electronOS = window.electronOS;
    this.isElectron = window.electronApp;
    this.downloadManager = window.downloadManager;

    if (this.isElectron) {
      this.downloadManager.on("download-manager-main", payload => {
        this.handleDesktopEvents(payload.action, payload);
      });
    }
  }

  isFileDownloaded(file) {
    return !!this.files.find(f => f.id === file.id);
  }

  @action
  highlightFile(file) {
    clearTimeout(this.highlightTimeout);
    this.highlightId = file.id;
    this.highlightTimeout = setTimeout(() => {
      this.highlightId = null;
    }, 5000);
  }

  @action
  upsertFile(newFile) {
    const currentFileIndex = this.files.findIndex(f => f.id === newFile.id);

    if (currentFileIndex > -1) {
      this.files[currentFileIndex] = newFile;
    } else {
      this.files.unshift(newFile);
    }
  }

  @action
  removeFile(file) {
    const currentFileIndex = this.files.findIndex(f => f.id === file.id);

    if (currentFileIndex > -1) {
      return this.files.splice(currentFileIndex, 1)[0];
    }

    return null;
  }

  showDownloadNotification = payload => {
    this.rootStore.sidemenuStore.showNotificationCard(
      "Download Complete",
      payload.filename,
      `download-${payload.id}`,
      () => {
        this.activateDrawer();
        window.dispatchEvent(new CustomEvent("notification-clicked"));
      }
    );
  };

  @action
  handleDesktopEvents = (eventName, payload) => {
    switch (eventName) {
      case "downloaded-files":
      case "download-reset":
        this.files = payload.files;
        break;
      case "download-queued":
      case "download-started":
      case "download-progress":
        this.upsertFile(payload);
        break;
      case "download-finished":
        this.upsertFile(payload);
        this.showDownloadNotification(payload);
        this.highlightFile(payload);
        break;
      case "download-canceled":
      case "download-removed":
        this.removeFile(payload);
        break;
      default:
        break;
    }
  };

  activateDrawer() {
    const { addonStore } = this.rootStore;
    addonStore.setAddonPanel("downloads");
    addonStore.toggleAddons(true);
  }

  @action
  sendDownloadRequest(file) {
    if (!this.isElectron) {
      return;
    }

    this.activateDrawer();

    // if file is downloaded, move it to the top
    if (this.isFileDownloaded(file)) {
      const removedFile = this.removeFile(file);
      this.upsertFile(removedFile);
      this.highlightFile(removedFile);
      return;
    }

    // workaround to generate absolute link from relative link
    const anchor = document.createElement("a");
    anchor.href = file.url;
    const requestUrl = `${anchor.href}?authenticationToken=${window.authenticationToken}`;

    this.send("downloadFile", {
      ...file,
      url: requestUrl
    });
  }

  @action
  send(eventName, payload) {
    if (!this.isElectron) {
      return;
    }

    this.downloadManager.send(eventName, payload);
  }
}

export default DesktopStore;
