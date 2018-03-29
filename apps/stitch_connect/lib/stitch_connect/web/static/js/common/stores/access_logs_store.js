import { observable, action, computed } from "mobx";
import groupBy from "lodash/groupBy";
import moment from "moment";

function getSortableLastAccessedAt(accessLog) {
  return moment
    .utc(accessLog.last_access_at)
    .local()
    .format("YYYY-MM-DD");
}

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

    const ceiling = Math.ceil(this.skippedLogs / this.perPage);
    if (ceiling === 0) {
      return 1;
    }

    return ceiling + 1;
  }

  @action
  loadTeamAccessLogs = (teamId, page) => {
    this.loading = true;
    const skipCount = (page - 1) * this.perPage;
    const logUrl = `/api/v1/teams/${teamId}/access_log?skip=${skipCount}&limit=${this.perPage}`;

    get(logUrl).then(resp => {
      this.totalLogs = resp.data.meta.count;
      this.skippedLogs = resp.data.meta.skip;
      this.accessLogs = groupBy(resp.data.data, getSortableLastAccessedAt);
      this.loading = false;
    });
  };
}

export default AccessLogsStore;
