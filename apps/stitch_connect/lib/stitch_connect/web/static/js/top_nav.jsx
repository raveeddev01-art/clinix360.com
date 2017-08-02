import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import Dropdown from "react-bootstrap/lib/Dropdown";
import Modal from "react-bootstrap/lib/Modal";
import Radio from "react-bootstrap/lib/Radio";
import Badge from "react-bootstrap/lib/Badge";
import Button from "react-bootstrap/lib/Button";

import sidemenuStore from "./chat/sidemenu/sidemenu_store.js";

export default class TopNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleMembersModal = () => {
    this.setState({
      showMembersModal: !this.state.showMembersModal
    });
  };

  toggleNotificationsModal = () => {
    this.setState({
      showNotificationsModal: !this.state.showNotificationsModal
    });
  };

  toggleRenameModal = () => {
    this.setState({
      showRenameModal: !this.state.showRenameModal
    });
  };

  toggleConvertModal = () => {
    this.setState({
      showConvertModal: !this.state.showConvertModal
    });
  };

  render() {
    const { showModal } = this.state;
    return (
      <div className="top-navigation">
        <div id="sidemenu">
          <div className="flex-header">
            <DropdownButton
              className="text-capitalize"
              block
              title={sidemenuStore.instance.teamName}
              id="dropdown-size-medium"
            >
              <h5 className="text-center">{`${window.currentUser
                .firstName} ${window.currentUser.lastName}`}</h5>

              <div className="separator text-center">
                <span>You</span>
              </div>

              <MenuItem eventKey="1" href="/admin/you/profile">
                Profile
              </MenuItem>
              <MenuItem eventKey="2" href="/admin/you/account">
                Account
              </MenuItem>
              <MenuItem eventKey="3" href="/admin/you/notifications">
                Notifications
              </MenuItem>

              <div className="separator text-center">
                <span>Admin</span>
              </div>

              <MenuItem eventKey="4" href="/admin/team">
                Team
              </MenuItem>
              <MenuItem eventKey="5" href="/admin/users/members">
                Users
              </MenuItem>
              <MenuItem eventKey="6" href="/admin/users/invite">
                Invite
              </MenuItem>

              <div className="separator text-center">
                <span>Stitch</span>
              </div>

              <MenuItem eventKey="7">Lockout</MenuItem>
              <MenuItem eventKey="6" href="/logout">
                Sign Out
              </MenuItem>
            </DropdownButton>
          </div>
        </div>
        <div id="main">
          <div className="flex-header main-header">
            <div className="header-content">
              <h4>
                <i className="fa fa-comments" /> General
              </h4>
            </div>

            <div className="header-nav">
              <Dropdown id="dropdown-group-controls" pullRight>
                <Dropdown.Toggle noCaret>
                  <i className="fa fa-cog" />
                </Dropdown.Toggle>

                <Dropdown.Menu className="group-controls-menu">
                  <MenuItem eventKey="1">Favorite</MenuItem>
                  <MenuItem eventKey="2" onClick={this.toggleMembersModal}>
                    Members
                  </MenuItem>
                  <MenuItem
                    eventKey="3"
                    onClick={this.toggleNotificationsModal}
                  >
                    Notifications
                  </MenuItem>
                  <MenuItem eventKey="4" onClick={this.toggleRenameModal}>
                    Rename
                  </MenuItem>
                  <MenuItem eventKey="5" onClick={this.toggleConvertModal}>
                    Convert
                  </MenuItem>
                  <MenuItem eventKey="6">Leave</MenuItem>
                  <MenuItem eventKey="7">Delete</MenuItem>
                </Dropdown.Menu>
              </Dropdown>

              <a
                href="#addons-toggle"
                className="btn btn-default"
                id="addons-toggle"
              >
                <i className="fa fa-info-circle" />
              </a>

              <input
                type="text"
                className="form-control"
                placeholder="Search"
              />
            </div>
          </div>
        </div>

        <Modal
          show={this.state.showMembersModal}
          onHide={this.toggleMembersModal}
        >
          <Modal.Header>
            <Modal.Title>Members</Modal.Title>
            <a href="#" onClick={this.toggleMembersModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>
          <Modal.Body>Body text</Modal.Body>
        </Modal>

        <Modal
          show={this.state.showNotificationsModal}
          onHide={this.toggleNotificationsModal}
          className="notifications-modal"
        >
          <Modal.Header>
            <Modal.Title>Notification Preferences: General</Modal.Title>
            <a href="#" onClick={this.toggleNotificationsModal}>
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
            <Button bsSize="large" bsStyle="primary">
              Done
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={this.state.showRenameModal}
          onHide={this.toggleRenameModal}
        >
          <Modal.Header>
            <Modal.Title>Rename Group</Modal.Title>
            <a href="#" onClick={this.toggleRenameModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>
          <Modal.Body>Body text</Modal.Body>
        </Modal>

        <Modal
          show={this.state.showConvertModal}
          onHide={this.toggleConvertModal}
        >
          <Modal.Header>
            <Modal.Title>Convert Group</Modal.Title>
            <a href="#" onClick={this.toggleConvertModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>
          <Modal.Body>Body text</Modal.Body>
        </Modal>
      </div>
    );
  }
}
