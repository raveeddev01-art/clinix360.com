import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Panel, Row, Col } from "react-bootstrap";
import PendingInvitationItem from "./pending-invitation-item";

const header = (
  <h1>
    <i className="fa fa-inbox" /> Pending
  </h1>
);

@inject("invitationStore", "titleStore", "adminPanelStore")
@observer
class UsersPending extends Component {
  componentWillMount() {
    this.props.invitationStore.loadInvitations();
    this.props.titleStore.setPageName("Pending");
    this.props.adminPanelStore.setHeading("Pending");
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
      <Panel className="admin-panel has-style" header={header}>
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
