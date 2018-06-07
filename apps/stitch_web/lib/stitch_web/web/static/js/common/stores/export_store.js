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
    return `/exports/${id}/download`;
  };
}

export default ExportStore;
