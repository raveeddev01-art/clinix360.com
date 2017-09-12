import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Radio from "react-bootstrap/lib/Radio";
import Button from "react-bootstrap/lib/Button";

@inject("groupStore")
@observer
export default class NavItemNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      setting: null
    };
  }

  _toggleModal = () => {
    if (!this.state.showModal) {
      this.setState({ setting: this.props.groupStore.notificationSetting });
      this.props.groupStore.loadNotificationSetting().then(setting => {
        this.setState({ setting });
      });
    }

    this.setState({
      showModal: !this.state.showModal
    });
  };

  _onChange = val => () => {
    this.setState({ setting: val });
  };

  _onSave = () => {
    this.props.groupStore.saveNotificationSetting(this.state.setting);
    this.setState({
      showModal: false
    });
  };

  render() {
    const { setting } = this.state;
    return (
      <MenuItem onClick={this._toggleModal}>
        Notifications
        <Modal
          show={this.state.showModal}
          onHide={this._toggleModal}
          className="notifications"
        >
          <Modal.Header>
            <Modal.Title>Notification Preferences: General</Modal.Title>
            <a href="#" onClick={this._toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <h5>
              Set notification preferences for the group. These preferences will
              apply to desktop and mobile.
            </h5>

            <div className="radio-group notifications">
              <Radio
                name="radioGroup"
                checked={setting === "everything"}
                onChange={this._onChange("everything")}
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
                onChange={this._onChange("mentions")}
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
                onChange={this._onChange("nothing")}
              >
                <span className="radio-span">
                  <h5>Nothing</h5>
                  <p className="m-b-0">
                    You will not receive notifications, but will continue to see
                    a badge count for unread messages.
                  </p>
                </span>
              </Radio>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this._toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary" onClick={this._onSave}>
              Save Settings
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
