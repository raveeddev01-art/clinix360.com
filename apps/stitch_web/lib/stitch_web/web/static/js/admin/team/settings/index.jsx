import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";

import withAlertState from "../../../util/with_alert_state";
import TeamNamePanel from "./team-name-panel";
import SecurityLockoutPanel from "./security-lockout-panel";
import InvitationControlPanel from "./invitation-control-panel";
// import DeleteTeamPanel from "./delete-team-panel";

@inject("titleStore", "adminPanelStore")
@withAlertState
class TeamSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Team Settings");
    this.props.adminPanelStore.setHeading("Settings", "fa-cogs");
  }

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-cogs" /> Settings
          </h1>
        </Panel.Heading>

        <Panel.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          <TeamNamePanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <SecurityLockoutPanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <InvitationControlPanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          {/* <DeleteTeamPanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          /> */}
        </Panel.Body>
      </Panel>
    );
  }
}

export default TeamSettings;
