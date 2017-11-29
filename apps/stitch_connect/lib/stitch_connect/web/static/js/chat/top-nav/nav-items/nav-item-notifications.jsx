import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Radio from "react-bootstrap/lib/Radio";
import Button from "react-bootstrap/lib/Button";

import { NOTIFICATION_PREFERENCES } from "lib/constants";

@inject("notificationStore", "groupsStore")
@observer
export default class NavItemNotifications extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      showModal: false,
      pref: ""
    };
  }

  onChange = pref => () => {
    this.setState({ pref });
  };

  onSave = () => {
    const { notificationStore, groupsStore: { currentGroup } } = this.props;

    notificationStore.updateGroupPref(currentGroup.id, this.state.pref);

    this.setState({
      showModal: false
    });
  };

  openModal = () => {
    const { notificationStore, groupsStore: { currentGroup } } = this.props;
    const pref = notificationStore.getGroupPrefById(currentGroup.id);

    this.setState({
      showModal: true,
      pref
    });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { groupsStore: { currentGroup } } = this.props;
    const { pref } = this.state;

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
            Notification Preferences: {currentGroup.name}
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
            {NOTIFICATION_PREFERENCES.map(p => (
              <Radio
                key={p.value}
                name="desktop-pref"
                checked={pref === p.value}
                onChange={this.onChange(p.value)}
              >
                <span className="radio-span">
                  <h5>{p.title}</h5>
                  <p className="m-b-0">{p.description}</p>
                </span>
              </Radio>
            ))}
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
