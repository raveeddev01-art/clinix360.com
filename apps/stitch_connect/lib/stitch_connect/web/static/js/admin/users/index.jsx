import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import FullMembersPanel from "./full-members-panel";
import PendingInvitationsPanel from "./pending-invitations-panel";
import InviteModal from "./invite-modal";

const header = (
  <h1>
    <i className="fa fa-users" /> Members
  </h1>
);

@inject("titleStore", "adminPanelStore")
@observer
class TeamSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false,
      showInviteModal: false
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

  showInviteModal = () => {
    this.setState({
      showInviteModal: true
    });
  };

  toggleInviteModal = () => {
    this.setState({
      showInviteModal: !this.state.showInviteModal
    });
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
        <div className="pull-right m-u-50">
          <Button bsStyle="primary" onClick={this.showInviteModal}>
            Invite Members
          </Button>
        </div>
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
        <PendingInvitationsPanel
          onSuccess={this.onSuccess}
          onError={this.onError}
          hideAlert={this.hideAlert}
        />
        <InviteModal
          show={this.state.showInviteModal}
          toggle={this.toggleInviteModal}
        />
      </Panel>
    );
  }
}

export default TeamSettings;
