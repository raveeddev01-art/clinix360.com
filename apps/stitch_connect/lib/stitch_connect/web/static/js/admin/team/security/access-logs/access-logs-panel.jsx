import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import SettingPanel from "../../../components/setting-panel/setting-panel";
import DayLog from "./day-log";

const title = "Access Logs";

@inject("userStore", "teamStore")
@observer
class AccessLogsPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const description = `This page lists details about account access for all members of your team. It is only accessible to administrators. Individual members can view their own access logs at https://${this
      .props.teamStore.slug}.teamstitch.com/admin/you/account`;

    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    return (
      <SettingPanel title={title} description={description} saveButtonText="">
        <DayLog date={new Date()} accessLogs={[]} />
        <DayLog date={new Date()} accessLogs={[]} />
      </SettingPanel>
    );
  }
}

AccessLogsPanel.propTypes = {};

export default AccessLogsPanel;
