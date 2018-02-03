import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
import TeamNamePanel from "./team-name-panel";
import SecurityLockoutPanel from "./security-lockout-panel";
import InvitationControlPanel from "./invitation-control-panel";
// import DeleteTeamPanel from "./delete-team-panel";

const header = (
  <h1>
    <i className="fa fa-cogs" /> Settings
  </h1>
);

@inject("titleStore", "adminPanelStore")
class TeamSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Team Settings");
    this.props.adminPanelStore.setHeading("Settings", "fa-cogs");
  }

  onSuccess = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "success"
    });
  };

  onError = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "danger"
    });
  };

  hideAlert = () => {
    this.setState({
      alertVisible: false
    });
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
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
      </Panel>
    );
  }
}

export default TeamSettings;
