import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import sidemenuStore from "./chat/sidemenu/sidemenu_store.js";

export default class TopNav extends Component {
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
              <MenuItem eventKey="6" href="/logout">Sign Out</MenuItem>
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
              <input
                type="text"
                className="form-control"
                placeholder="Search"
              />
              <a href="#addons-toggle" className="btn" id="addons-toggle">
                <i className="fa fa-info-circle" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
