import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Panel, Row, Col } from "react-bootstrap";
import PendingInvitationItem from "./pending-invitation-item.jsx";

@inject("invitationStore")
@observer
class UsersPending extends Component {
  componentWillMount() {
    this.props.invitationStore.loadInvitations();
  }

  _renderInvitations = () => {
    const { invitationStore } = this.props;
    return invitationStore.invitations.map(invitation => {
      const onRevoke = () => invitationStore.revokeInvitation(invitation.id);
      const onResend = () => invitationStore.resendInvitation(invitation.id);
      return (
        <PendingInvitationItem
          key={`invitation_${invitation.id}`}
          email={invitation.email}
          id={invitation.id}
          onRevoke={onRevoke}
          onResend={onResend}
        />
      );
    });
  };

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title">Pending</h1>

        <p className="m-b-20">
          View any outstanding invitations to join the team here. Revoking an
          invite will remove it from this list and deactivate the invite link.
          To resend an invitation multiple times, you can reload this page.
        </p>

        <div className="admin-table m-b-20">
          <div className="table-head">
            <Row>
              <Col sm={8}>Email Address</Col>
              <Col sm={4} className="text-center">
                Actions
              </Col>
            </Row>
          </div>
          {this._renderInvitations()}
        </div>
      </Panel>
    );
  }
}

export default UsersPending;
