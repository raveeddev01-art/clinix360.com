import React, { Component } from "react";
import { Panel, Row, Col } from "react-bootstrap";
import PendingInvitationItem from "./pending-invitation-item.jsx";

export default class UsersPending extends Component {
  constructor(props) {
    super(props);
  }

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

          <PendingInvitationItem
            user={{
              id: 1,
              email: "daniel@outlook.com"
            }}
          />

          <PendingInvitationItem
            user={{
              id: 2,
              email: "hello@outlook.com"
            }}
          />

          <PendingInvitationItem
            user={{
              id: 3,
              email: "mailbox@gmail.com"
            }}
          />
        </div>
      </Panel>
    );
  }
}
