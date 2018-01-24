import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";
import MemberItem from "./member-item";
import SettingPanel from "../components/setting-panel/setting-panel";

class MembersPanel extends Component {
  render() {
    const {
      title,
      description,
      users,
      onSuccess,
      onError,
      hideAlert
    } = this.props;

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
          {users.map(user => {
            return (
              <MemberItem
                onSuccess={onSuccess}
                onError={onError}
                hideAlert={hideAlert}
                user={user}
                online={user.online}
                key={user.id}
              />
            );
          })}
        </div>
      </SettingPanel>
    );
  }
}

MembersPanel.propTypes = {
  users: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default MembersPanel;
