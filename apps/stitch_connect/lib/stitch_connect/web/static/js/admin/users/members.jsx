import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Panel, Row, Col } from "react-bootstrap";
import MemberItem from "./member-item";

const header = (
  <h1>
    <i className="fa fa-users" /> Members
  </h1>
);

@inject("membersStore", "titleStore")
@observer
export default class UsersMembers extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Members");
  }

  render() {
    const { membersStore } = this.props;
    const onlineUsers = membersStore.onlineUsers;
    const offlineUsers = membersStore.offlineUsers;

    return (
      <Panel className="admin-panel" header={header}>
        <p className="m-b-20">
          Manage your users by controlling admin abilities and account status.
          For more information on how account enabling and disabling works, see
          our support article&nbsp;
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
          {onlineUsers.map(user => {
            return <MemberItem user={user} online key={user.id} />;
          })}
          {offlineUsers.map(user => {
            return <MemberItem user={user} online={false} key={user.id} />;
          })}
        </div>
      </Panel>
    );
  }
}
