import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import Well from "react-bootstrap/lib/Well";
import TeamNamePanel from "./team-name-panel";
import SecurityLockoutPanel from "./security-lockout-panel";
import InvitationControlPanel from "./invitation-control-panel";
import DeleteTeamPanel from "./delete-team-panel";

class TeamSettings extends Component {
  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title text-center">Settings</h1>
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
