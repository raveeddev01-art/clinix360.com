import { observable, action } from "mobx";

class ExportStore {
  @observable loading = false;
  @observable exports = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadExports = () => {
    this.loading = true;
    get(`/api/v1/exports`).then(resp => {
      const { data } = resp;
      this.exports = data;
      this.loading = false;
    });
  };

  @action
  createExport = () => {
    post(`/api/v1/exports`).then(() => {
      this.loadExports();
    });
  };

  @action
  downloadLink = id => {
    return `/api/v1/exports/${id}/download?authenticationToken=${window.authenticationToken}`;
  };
}

export default ExportStore;
