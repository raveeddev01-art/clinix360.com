import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import Dropdown from "react-bootstrap/lib/Dropdown";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

import NavItemMembers from "./nav-items/nav-item-members.jsx";
import NavItemNotifications from "./nav-items/nav-item-notifications.jsx";
import NavItemRename from "./nav-items/nav-item-rename.jsx";
import NavItemConvert from "./nav-items/nav-item-convert.jsx";

import sidemenuStore from "../chat/sidemenu/sidemenu_store.js";

export default class TopNav extends Component {
  constructor(props) {
    super(props);
  }

  render() {
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
                  <MenuItem>Favorite</MenuItem>

                  <NavItemMembers />
                  <NavItemNotifications />
                  <NavItemRename />
                  <NavItemConvert />

                  <MenuItem>Leave</MenuItem>
                  <MenuItem>Delete</MenuItem>
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

        {/* <Modal
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

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleMembersModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Done
            </Button>
          </Modal.Footer>
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
            <Button bsSize="large" onClick={this.toggleNotificationsModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Save Settings
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

          <Modal.Body>
            <Form horizontal>
              <FormGroup bsSize="large">
                <Col componentClass={ControlLabel} sm={3}>
                  Name
                </Col>

                <Col sm={9}>
                  <FormControl
                    name="name"
                    type="text"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleRenameModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Rename Group
            </Button>
          </Modal.Footer>
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

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleConvertModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary">
              Convert Group
            </Button>
          </Modal.Footer>
        </Modal> */}
      </div>
    );
  }
}
