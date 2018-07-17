// @TODO move over badge related stuff over to this store
/**
 * This store contains all communication with desktop app
 */
class DesktopStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  sendDownloadRequest(url, filename) {
    // workaround to generate absolute link from relative link
    const anchor = document.createElement("a");
    anchor.href = url;
    window.dispatchEvent(
      new CustomEvent("download-file", {
        detail: {
          url: `${anchor.href}?authenticationToken=${window.authenticationToken}`,
          filename
        }
      })
    );
  }
}

export default DesktopStore;
