import React, { Component } from "react";
import {
  Panel,
  Well,
  Row,
  Col,
  Collapse,
  ButtonToolbar,
  Button
} from "react-bootstrap";
import MemberItem from "./member-item.jsx";

export default class UsersMembers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title">Members</h1>

        <p>
          Manage your users by controlling admin abilities and account status.
          For more information on how account enabling and disabling works, see
          our support article{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us/articles/216488668-User-management">
            here
          </a>.
        </p>

        <div className="members">
          <div className="members-head">
            <Row>
              <Col sm={6}>Users</Col>
              <Col sm={4} className="text-center">
                Status
              </Col>
              <Col sm={2} className="text-center">
                Actions
              </Col>
            </Row>
          </div>

          <MemberItem
            user={{
              id: 1,
              name: "Daniel Tapia",
              username: "danieltapia",
              email: "daniel@outlook.com"
            }}
          />
          <MemberItem
            user={{
              id: 2,
              name: "Jake Stump",
              username: "jstump",
              email: "jstump@email.com"
            }}
          />
          <MemberItem
            user={{
              id: 3,
              name: "Emily Flannigan",
              username: "emily",
              email: "emilyf@domain.com"
            }}
          />
        </div>
      </Panel>
    );
  }
}
