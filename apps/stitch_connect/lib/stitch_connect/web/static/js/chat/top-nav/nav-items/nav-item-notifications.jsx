import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Radio from "react-bootstrap/lib/Radio";
import Button from "react-bootstrap/lib/Button";

@inject("groupStore")
@observer
export default class NavItemNotifications extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      showModal: false,
      setting: null
    };
  }

  onChange = val => () => {
    this.setState({ setting: val });
  };

  onSave = () => {
    this.props.groupStore.saveNotificationSetting(this.state.setting);
    this.setState({
      showModal: false
    });
  };

  openModal = () => {
    this.setState({ setting: this.props.groupStore.notificationSetting });
    this.props.groupStore.loadNotificationSetting().then(setting => {
      this.setState({ setting });
    });

    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { setting } = this.state;
    return [
      <MenuItem key="notifications_menuitem" onClick={this.openModal}>
        Notifications
      </MenuItem>,
      <Modal
        key="notifications_modal"
        show={this.state.showModal}
        className="notifications"
      >
        <Modal.Header>
          <Modal.Title>
            Notification Preferences: {this.props.groupStore.group.name}
          </Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <h5>
            Set notification preferences for the room. These preferences will
            apply to desktop and mobile.
          </h5>

          <div className="radio-group notifications">
            <Radio
              name="radioGroup"
              checked={setting === "everything"}
              onChange={this.onChange("everything")}
            >
              <span className="radio-span">
                <h5>Everything</h5>
                <p className="m-b-0">
                  You will be notified for every new message.
                </p>
              </span>
            </Radio>

            <Radio
              name="radioGroup"
              checked={setting === "mentions"}
              onChange={this.onChange("mentions")}
            >
              <span className="radio-span">
                <h5>Mentions</h5>
                <p className="m-b-0">
                  You will be notified only when a team member mentions you.
                </p>
              </span>
            </Radio>

            <Radio
              name="radioGroup"
              checked={setting === "nothing"}
              onChange={this.onChange("nothing")}
            >
              <span className="radio-span">
                <h5>Nothing</h5>
                <p className="m-b-0">
                  You will not receive notifications, but will continue to see a
                  badge count for unread messages.
                </p>
              </span>
            </Radio>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button bsSize="large" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.onSave}>
            Save Settings
          </Button>
        </Modal.Footer>
      </Modal>
    ];
  }
}
