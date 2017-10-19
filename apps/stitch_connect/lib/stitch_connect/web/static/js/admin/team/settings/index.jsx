import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { inject } from "mobx-react";
import TeamNamePanel from "./team-name-panel";
import SecurityLockoutPanel from "./security-lockout-panel";
import InvitationControlPanel from "./invitation-control-panel";
// import DeleteTeamPanel from "./delete-team-panel";

const header = (
  <h1>
    <i className="fa fa-cogs" /> Settings
  </h1>
);

@inject("titleStore")
class TeamSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Team Settings");
  }

  render() {
    return (
      <Panel className="admin-panel" header={header}>
        <TeamNamePanel />
        <hr />
        <SecurityLockoutPanel />
        <hr />
        <InvitationControlPanel />
        {/* <hr />
        <DeleteTeamPanel /> */}
      </Panel>
    );
  }
}

export default TeamSettings;
