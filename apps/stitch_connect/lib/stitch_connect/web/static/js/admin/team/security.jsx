import React, { Component } from "react";
import { inject } from "mobx-react";
import { Panel } from "react-bootstrap";
import TeamExport from "./export";
import TeamHipaa from "./hipaa";
import AccessLogsPanel from "./security/access-logs/access-logs-panel";

const header = (
  <h1>
    <i className="fa fa-shield" /> Security
  </h1>
);

@inject("titleStore", "adminPanelStore")
class TeamSecurity extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Security");
    this.props.adminPanelStore.setHeading("Security", "fa-shield");
  }

  render() {
    return (
      <Panel className="admin-panel" header={header}>
        <TeamHipaa />
        <TeamExport />
        <AccessLogsPanel />
      </Panel>
    );
  }
}

export default TeamSecurity;
