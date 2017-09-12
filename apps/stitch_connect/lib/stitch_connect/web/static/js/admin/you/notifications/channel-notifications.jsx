import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Radio from "react-bootstrap/lib/Radio";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

@inject("notificationStore")
@observer
class ChannelNotifications extends Component {
  onChange = (groupId, val) => () => {
    this.props.notificationStore.groupPreferenceMap[groupId] = val;
  };

  onSave = () => {
    this.props.notificationStore.updateGroupPreferences();
  };

  toggleEdit = val => () => {
    this.props.notificationStore.toggleGroupPreferences(val);
  };

  renderRow = preference => {
    const val = this.props.notificationStore.groupPreferenceMap[
      preference.group_id
    ];
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

  renderForm = () => {
    const { notificationStore } = this.props;
    return (
      <div>
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
        <div className="clearfix">
          <Button
            bsStyle="default"
            className="btn-fancy pull-left"
            onClick={this.toggleEdit(false)}
          >
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            className="btn-fancy pull-right"
            onClick={this.onSave}
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { notificationStore } = this.props;
    const isEditing = notificationStore.openGroupPreferences;
    return (
      <div>
        {!isEditing &&
          <Button
            bsStyle="default"
            className="action-edit btn-fancy pull-right"
            onClick={this.toggleEdit(true)}
          >
            Edit
          </Button>}
        <h3>Channel Specific Preference</h3>
        <a name="groupPreference" />
        {isEditing && this.renderForm()}
      </div>
    );
  }
}

export default ChannelNotifications;
