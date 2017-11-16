import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
import FullMembersPanel from "./full-members-panel";

const header = (
  <h1>
    <i className="fa fa-users" /> Members
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
    this.props.titleStore.setPageName("Members");
    this.props.adminPanelStore.setHeading("Members", "fa-users");
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
        <p className="m-b-20">
          Manage your users by controlling admin abilities and account status.
          For more information on how account enabling and disabling works, see
          our support article&nbsp;
          <a href="https://intercom.help/teamstitch/connect/admin/user-management">
            here
          </a>.
        </p>
        {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
        <FullMembersPanel
          onSuccess={this.onSuccess}
          onError={this.onError}
          hideAlert={this.hideAlert}
        />
      </Panel>
    );
  }
}

export default TeamSettings;
