import React, { Component } from "react";
import PropTypes from "prop-types";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import Radio from "react-bootstrap/lib/Radio";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import set from "lodash/set";

import SettingPanel from "../../components/setting-panel/setting-panel";

const PREF_OPTIONS = ["everything", "mentions", "nothing"];

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
      .updateGroupPreferences(this.state.groupPrefs)
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
        groupPrefs: toJS(notificationStore.groupPreferences)
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
            {PREF_OPTIONS.map(option => (
              <Col key={option} sm={4}>
                <Radio
                  name={`group_pref_${groupId}`}
                  checked={pref === option}
                  onChange={this.onChange(groupIndex, option)}
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
              <Col sm={4}>
                <b>Everything</b>
              </Col>
              <Col sm={4}>
                <b>Mentions</b>
              </Col>
              <Col sm={4}>
                <b>Nothing</b>
              </Col>
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
