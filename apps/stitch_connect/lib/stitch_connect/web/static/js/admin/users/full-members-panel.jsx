import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Row, Col } from "react-bootstrap";
import MemberItem from "./member-item";
import SettingPanel from "../components/setting-panel/setting-panel";

const title = "Full Members";
const description =
  "Manage full team members and their roles as owners, admins, or members.";

@inject("sidemenuStore")
@observer
class FullMembersPanel extends Component {
  render() {
    const { sidemenuStore } = this.props;

    return (
      <SettingPanel saveButtonText="" title={title} description={description}>
        <div className="admin-table m-b-20">
          <div className="table-head">
            <Row>
              <Col xs={6}>Users</Col>
              <Col xs={3} className="text-center">
                Roles
              </Col>
              <Col xs={3} className="text-right">
                Actions
              </Col>
            </Row>
          </div>
          {sidemenuStore.onlineUsers.map(user => {
            return (
              <MemberItem {...this.props} user={user} online key={user.id} />
            );
          })}
          {sidemenuStore.offlineUsers.map(user => {
            return (
              <MemberItem
                {...this.props}
                user={user}
                online={false}
                key={user.id}
              />
            );
          })}
        </div>
      </SettingPanel>
    );
  }
}

FullMembersPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default FullMembersPanel;
