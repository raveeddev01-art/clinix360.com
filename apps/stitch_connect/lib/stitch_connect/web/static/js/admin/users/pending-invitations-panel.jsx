import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Row, Col } from "react-bootstrap";
import SettingPanel from "../components/setting-panel/setting-panel";
import PendingInvitationItem from "./pending-invitation-item";

const title = "Pending Members";
const description = "Review pending accounts to revoke or resend invitations.";

@inject("invitationStore")
@observer
class PendingInvitationsPanel extends Component {
  onToggleEdit = isEditing => {
    if (isEditing) this.props.invitationStore.loadInvitations();
  };

  _renderInvitations = () => {
    const { invitationStore } = this.props;
    return invitationStore.invitations.map(invitation => {
      return (
        <PendingInvitationItem
          {...this.props}
          key={`invitation_${invitation.id}`}
          email={invitation.email}
          id={invitation.id}
        />
      );
    });
  };

  render() {
    return (
      <SettingPanel
        saveButtonText=""
        title={title}
        description={description}
        onEdit={this.onToggleEdit}
      >
        <p className="m-b-20">
          View any outstanding invitations to join the team here. Revoking an
          invite will remove it from this list and deactivate the invite link.
          To resend an invitation multiple times, you can reload this page.
        </p>

        <div className="admin-table m-b-20">
          <div className="table-head">
            <Row>
              <Col xs={8}>Email Address</Col>
              <Col xs={4} className="text-center">
                Actions
              </Col>
            </Row>
          </div>
          {this._renderInvitations()}
        </div>
      </SettingPanel>
    );
  }
}

// PendingInvitationsPanel.propTypes = {
//   onSuccess: PropTypes.func.isRequired,
//   onError: PropTypes.func.isRequired,
//   hideAlert: PropTypes.func.isRequired
// };

export default PendingInvitationsPanel;
