import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import SettingPanel from "../../../components/setting-panel/setting-panel";
import DayLog from "./day-log";

const title = "Access Logs";

@inject("teamStore", "accessLogsStore")
@observer
class AccessLogsPanel extends Component {
  constructor(props) {
    super(props);
    props.accessLogsStore.loadTeamAccessLogs(props.teamStore.id);
  }

  render() {
    const description = `This page lists details about account access for all members of your team. It is only accessible to administrators. Individual members can view their own access logs at https://${this
      .props.teamStore.slug}.teamstitch.com/admin/you/account`;

    return (
      <SettingPanel title={title} description={description} saveButtonText="">
        {!this.props.accessLogsStore.loading &&
          _.forOwn(this.props.accessLogsStore.accessLogs, function(
            groupedLogs,
            date
          ) {
            <DayLog date={date} accessLogs={groupedLogs} />;
          })}
      </SettingPanel>
    );
  }
}

AccessLogsPanel.propTypes = {};

export default AccessLogsPanel;
