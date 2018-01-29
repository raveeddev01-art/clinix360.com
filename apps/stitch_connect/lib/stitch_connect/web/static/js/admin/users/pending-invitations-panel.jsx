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
  componentWillMount() {
    const { invitationStore } = this.props;

    invitationStore.loadInvitations();
  }

  render() {
    const { invitationStore: { invitations } } = this.props;

    return (
      invitations.length > 0 && (
        <SettingPanel saveButtonText="" title={title} description={description}>
          <p className="m-b-20">
            View any outstanding invitations to join the team here. Revoking an
            invite will remove it from this list and deactivate the invite link.
            To resend an invitation multiple times, you can reload this page.
          </p>

          <div className="admin-table m-b-20">
            <div className="table-head">
              <Row>
                <Col xs={5}>Email Address</Col>
                <Col xs={3} className="text-center">
                  Role
                </Col>
                <Col xs={4} className="text-center">
                  Actions
                </Col>
              </Row>
            </div>

            {invitations.map(invitation => (
              <PendingInvitationItem
                {...this.props}
                key={`invitation_${invitation.id}`}
                roles={invitation.roles || ["member"]}
                groups={invitation.groups_as_guests}
                email={invitation.email}
                id={invitation.id}
              />
            ))}
          </div>
        </SettingPanel>
      )
    );
  }
}

PendingInvitationsPanel.propTypes = {};

export default PendingInvitationsPanel;
