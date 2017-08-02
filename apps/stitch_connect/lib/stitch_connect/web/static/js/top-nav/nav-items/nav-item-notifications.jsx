import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Radio from "react-bootstrap/lib/Radio";
import Badge from "react-bootstrap/lib/Badge";
import Button from "react-bootstrap/lib/Button";

export default class NavItemNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  render() {
    return (
      <MenuItem onClick={this.toggleModal}>
        Notifications
        <Modal
          show={this.state.showModal}
          onHide={this.toggleModal}
          className="notifications-modal"
        >
          <Modal.Header>
            <Modal.Title>Notification Preferences: General</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <h5>
              Set notification preferences for the group. These preferences will
              apply to desktop and mobile.
            </h5>

            <div className="radio-group">
              <Radio name="radioGroup" defaultChecked>
                <span className="radio-span">
                  <h5>Everything</h5>
                  <p className="m-b-0">
                    You will be notified for every new message.
                  </p>
                </span>
              </Radio>

              <Radio name="radioGroup">
                <span className="radio-span">
                  <h5>Mentions</h5>
                  <p className="m-b-0">
                    You will be notified only when a team member mentions you.
                  </p>
                </span>
              </Radio>

              <Radio name="radioGroup">
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
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Save Settings
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
