import { observable, action } from "mobx";

class ExportStore {
  @observable loading = false;
  @observable exports = [];
  @observable exporting = false;

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
      this.exporting = true;
      this.loadExports();
    });
  };

  @action
  updateState = (id, newStatus) => {
    this.exporting = false;
    this.exports.forEach(record => {
      if (record.id === id) {
        record.status = newStatus;
      }
    });
  };

  @action
  downloadLink = id => {
    return `/exports/${id}/download`;
  };
}

export default ExportStore;
