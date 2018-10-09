import { observable, action } from "mobx";

class MemberExportSore {
  @observable loading = false;
  @observable exports = [];
  @observable exporting = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadExports = () => {
    this.loading = true;
    return get(`/api/v1/exports/user_exports`).then(resp => {
      const { data } = resp;
      this.exports = data;
      this.loading = false;
    });
  };

  @action
  createExport = userId => {
    return post(`/api/v1/exports/${userId}/user_exports`).then(resp => {
      const { data } = resp;
      this.exporting = true;
      this.exports.push(data.data);
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
    return `/user_exports/${id}/download`;
  };
}

export default MemberExportSore;
