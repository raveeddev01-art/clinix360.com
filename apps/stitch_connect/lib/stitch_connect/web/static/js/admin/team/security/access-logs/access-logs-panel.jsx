import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import SettingPanel from "../../../components/setting-panel/setting-panel";
import DayLog from "./day-log";
import Pagination from "../../../../common/components/pagination";

const title = "Access Logs";

@inject("teamStore", "accessLogsStore")
@observer
class AccessLogsPanel extends Component {
  constructor(props) {
    super(props);
    props.accessLogsStore.loadTeamAccessLogs(props.teamStore.id);
  }

  _test = () => {
    console.log("PAGE CLICK");
  };

  render() {
    const description = `This page lists details about account access for all members of your team. It is only accessible to administrators. Individual members can view their own access logs at https://${this
      .props.teamStore.slug}.teamstitch.com/admin/you/account`;

    return (
      <SettingPanel title={title} description={description} saveButtonText="">
        {!this.props.accessLogsStore.loading &&
          Object.keys(this.props.accessLogsStore.accessLogs).map(date => (
            <DayLog
              key={date}
              date={date}
              accessLogs={this.props.accessLogsStore.accessLogs[date]}
            />
          ))}
        <Pagination
          activePage={this.props.accessLogsStore.activePage}
          perPage={this.props.accessLogsStore.perPage}
          total={this.props.accessLogsStore.totalLogs}
          onPageClick={this._test}
        />
      </SettingPanel>
    );
  }
}

AccessLogsPanel.propTypes = {};

export default AccessLogsPanel;
