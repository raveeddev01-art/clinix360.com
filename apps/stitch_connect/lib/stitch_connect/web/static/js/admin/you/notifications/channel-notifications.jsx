import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Radio from "react-bootstrap/lib/Radio";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import SettingPanel from "../../components/setting-panel/setting-panel";

@inject("notificationStore")
@observer
class ChannelNotifications extends Component {
  onChange = (groupId, val) => () => {
    this.props.notificationStore.groupPreferenceMap.set(groupId, val);
  };

  onSave = () => {
    this.props.notificationStore.updateGroupPreferences().then(() => {
      notify.show("Room specific notification settings updated");
    });
  };

  onToggleEdit = val => {
    this.props.notificationStore.toggleGroupPreferences(val);
  };

  renderRow = preference => {
    const val = this.props.notificationStore.groupPreferenceMap.get(
      preference.group_id
    );
    return (
      <div
        key={`group_${preference.group_id}`}
        className="clearfix notifications-table-row"
      >
        <Col md={6}>
          {preference.group_name}
        </Col>
        <Col md={6} className="text-center">
          <Row className="radio-group">
            <Col md={4}>
              <Radio
                name={`radioGroup_${preference.group_id}`}
                checked={val === "everything"}
                onChange={this.onChange(preference.group_id, "everything")}
              />
            </Col>
            <Col md={4}>
              <Radio
                name={`radioGroup_${preference.group_id}`}
                checked={val === "mentions"}
                onChange={this.onChange(preference.group_id, "mentions")}
              />
            </Col>
            <Col md={4}>
              <Radio
                name={`radioGroup_${preference.group_id}`}
                checked={val === "nothing"}
                onChange={this.onChange(preference.group_id, "nothing")}
              />
            </Col>
          </Row>
        </Col>
      </div>
    );
  };

  render() {
    const { notificationStore } = this.props;

    return (
      <SettingPanel
        title="Room Specific Notifications"
        description=""
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
      >
        <div className="clearfix notifications-table-heading text-center">
          <Col md={6} />
          <Col md={2}>
            <b>Everything</b>
          </Col>
          <Col md={2}>
            <b>Mentions</b>
          </Col>
          <Col md={2}>
            <b>Nothing</b>
          </Col>
        </div>
        {notificationStore.groupPreferences.map(group => this.renderRow(group))}
      </SettingPanel>
    );
  }
}

export default ChannelNotifications;
