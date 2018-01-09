import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Row, Col } from "react-bootstrap";
import MemberItem from "./member-item";
import SettingPanel from "../components/setting-panel/setting-panel";

const title = "Deactivated Members";
const description = "Manage deactivated members and re-enable accounts.";

@inject("usersStore")
@observer
class DisabledMembersPanel extends Component {
  render() {
    const { usersStore } = this.props;

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
          {usersStore.deactivatedUsers.map(user => {
            return (
              <MemberItem
                {...this.props}
                user={user}
                online={false}
                avatar={false}
                key={user.id}
              />
            );
          })}
        </div>
      </SettingPanel>
    );
  }
}

DisabledMembersPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default DisabledMembersPanel;
