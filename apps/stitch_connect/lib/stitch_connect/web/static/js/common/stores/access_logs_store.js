import { observable, action } from "mobx";
import moment from "moment";

class AccessLogsStore {
  @observable loading = false;
  @observable accessLogs = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadTeamAccessLogs = team_id => {
    this.loading = true;

    get(`/api/v1/teams/${team_id}/access_log`).then(resp => {
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
