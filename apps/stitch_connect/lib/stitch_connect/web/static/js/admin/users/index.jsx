import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import InviteModal from "common/modals/invite-modal";
import { isFullMember } from "lib/utils";

import MembersPanel from "./members-panel";
import DeactivatedMembersPanel from "./deactivated-members-panel";
import PendingInvitationsPanel from "./pending-invitations-panel";
import MemberTypeModal from "./member-type-modal";

@inject("titleStore", "adminPanelStore", "usersStore")
@observer
class TeamSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false,
      showMemberTypeModal: false,
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

  showMemberTypeModal = () => {
    this.setState({
      showMemberTypeModal: true
    });
  };

  toggleInviteModal = () => {
    this.setState({
      showInviteModal: !this.state.showInviteModal
    });
  };

  toggleMemberTypeModal = () => {
    this.setState({
      showMemberTypeModal: !this.state.showMemberTypeModal
    });
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;
    const { usersStore } = this.props;
    const users = [
      ...usersStore.onlineUsers.map(u => ({ ...u, online: true })),
      ...usersStore.offlineUsers.map(u => ({ ...u, online: false }))
    ];
    const fullMembers = users.filter(u => isFullMember(u));
    const guests = users.filter(u => !isFullMember(u));
    const header = (
      <h1>
        <i className="fa fa-users" /> Members
      </h1>
    );

    return (
      <Panel className="admin-panel" header={header}>
        <div className="pull-right m-u-58">
          <Button
            bsStyle="primary"
            onClick={this.showInviteModal}
            className="btn-invite-members"
          >
            Invite Members
          </Button>
        </div>

        <p className="m-b-20">
          Manage your users by controlling admin abilities and account status.
          For more information on how account enabling and disabling works, see
          our support article&nbsp;
          <a
            href="https://intercom.help/teamstitch/connect/admin/user-management"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>.
        </p>

        {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}

        <MembersPanel
          title="Members"
          description="Manage your users by controlling admin abilities and account status. For more information on how account enabling and disabling works, see our support article."
          users={fullMembers}
          onSuccess={this.onSuccess}
          onError={this.onError}
          hideAlert={this.hideAlert}
        />

        {guests.length > 0 && (
          <MembersPanel
            title="Guests"
            description="Manage guests (single room guests and multi room guests) and their rooms."
            users={guests}
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
        )}

        <DeactivatedMembersPanel
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

        <MemberTypeModal />
      </Panel>
    );
  }
}

export default TeamSettings;
