import React, { Component } from "react";
import PropTypes from "prop-types";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import Radio from "react-bootstrap/lib/Radio";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import set from "lodash/set";

import { NOTIFICATION_PREFERENCES } from "lib/constants";
import SettingPanel from "../../components/setting-panel/setting-panel";

@inject("notificationStore")
@observer
class ChannelNotifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groupPrefs: []
    };
  }

  onChange = (groupIndex, pref) => () => {
    const newGroupPrefs = set(
      this.state.groupPrefs,
      `[${groupIndex}].desktop_notification_preference`,
      pref
    );

    this.setState({
      groupPrefs: newGroupPrefs
    });
  };

  onSave = () => {
    const { hideAlert, onSuccess, onError, notificationStore } = this.props;

    hideAlert();

    return notificationStore
      .updateGroupPrefs(this.state.groupPrefs)
      .then(() => {
        onSuccess("Room specific notification settings have been updated.");
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  onToggleEdit = val => {
    const { notificationStore } = this.props;

    // When panel is open, load group preferences from the store
    if (val) {
      this.setState({
        groupPrefs: toJS(notificationStore.groupPrefs)
      });
    }
  };

  renderRow = (groupPref, groupIndex) => {
    const {
      group_id: groupId,
      group_name: groupName,
      desktop_notification_preference: pref
    } = groupPref;

    return (
      <div
        key={`group_${groupId}`}
        className="clearfix notifications-table-row"
      >
        <Col xs={6}>{groupName}</Col>
        <Col xs={6} className="text-center">
          <Row className="radio-group">
            {NOTIFICATION_PREFERENCES.map(({ value }) => (
              <Col key={value} sm={4}>
                <Radio
                  name={`group_pref_${groupId}`}
                  checked={pref === value}
                  onChange={this.onChange(groupIndex, value)}
                />
              </Col>
            ))}
          </Row>
        </Col>
      </div>
    );
  };

  render() {
    return (
      <SettingPanel
        title="Room Specific Notifications"
        description=""
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
      >
        <div className="clearfix notifications-table-heading text-center">
          <Col xs={6} />
          <Col xs={6}>
            <Row>
              {NOTIFICATION_PREFERENCES.map(({ title }) => (
                <Col key={title} sm={4}>
                  <b>{title}</b>
                </Col>
              ))}
            </Row>
          </Col>
        </div>
        {this.state.groupPrefs.map((pref, index) =>
          this.renderRow(pref, index)
        )}
      </SettingPanel>
    );
  }
}

ChannelNotifications.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default ChannelNotifications;
