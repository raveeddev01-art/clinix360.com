import { observable, action, computed } from "mobx";
import moment from "moment";

class AccessLogsStore {
  @observable loading = false;
  @observable accessLogs = null;
  @observable perPage = 50;
  @observable totalLogs = 0;
  @observable skippedLogs = 0;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get activePage() {
    if (this.skippedLogs === 0) {
      return 1;
    }

    let ceiling = Math.ceil(this.skippedLogs / this.perPage);
    if (ceiling === 0) {
      return 1;
    }

    return ceiling;
  }

  @action
  loadTeamAccessLogs = (team_id, page) => {
    this.loading = true;
    page = page - 1;

    get(
      `/api/v1/teams/${team_id}/access_log?skip=${page *
        this.perPage}&limit=${this.perPage}`
    ).then(resp => {
      this.totalLogs = resp.data.meta.count;
      this.skippedLogs = resp.data.meta.skip;

      let groupedData = _.groupBy(resp.data.data, access_log =>
        moment
          .utc(access_log.last_access_at)
          .local()
          .format("YYYY-MM-DD")
      );

      this.accessLogs = groupedData;
      this.loading = false;
    });
  };
}

export default AccessLogsStore;
