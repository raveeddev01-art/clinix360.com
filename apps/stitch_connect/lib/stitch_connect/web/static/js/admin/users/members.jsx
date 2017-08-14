import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Panel, Row, Col } from "react-bootstrap";
import MemberItem from "./member-item";

@inject("teamStore")
@observer
export default class UsersMembers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title">Members</h1>

        <p className="m-b-20">
          Manage your users by controlling admin abilities and account status.
          For more information on how account enabling and disabling works, see
          our support article{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us/articles/216488668-User-management">
            here
          </a>.
        </p>

        <div className="admin-table m-b-20">
          <div className="table-head">
            <Row>
              <Col sm={6}>Users</Col>
              <Col sm={2} className="text-center">
                Roles
              </Col>
              <Col sm={2} className="text-center">
                Status
              </Col>
              <Col sm={2} className="text-center">
                Actions
              </Col>
            </Row>
          </div>
          {this.props.teamStore.onlineUsers.map(user => {
            return <MemberItem user={user} online={true} key={user.id} />;
          })}
          {this.props.teamStore.offlineUsers.map(user => {
            return <MemberItem user={user} online={false} key={user.id} />;
          })}
        </div>
      </Panel>
    );
  }
}
