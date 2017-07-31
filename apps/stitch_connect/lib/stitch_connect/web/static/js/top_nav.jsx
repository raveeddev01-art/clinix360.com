import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import sidemenuStore from "./chat/sidemenu/sidemenu_store.js";

export default class TopNav extends Component {

  render() {
    return (
      <div className="top-navigation flex-wrapper">
        <div id="sidemenu">
          <div className="flex-header">
            <DropdownButton
              className="text-capitalize"
              block
              title={sidemenuStore.instance.teamName}
              id="dropdown-size-medium"
            >
              <MenuItem>{`${window.currentUser.firstName} ${window.currentUser
                .lastName}`}</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="1">Profile</MenuItem>
              <MenuItem eventKey="2">Account</MenuItem>
              <MenuItem eventKey="3">Notifications</MenuItem>
              <MenuItem eventKey="4">Invite</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="5" href="/admin/team">
                Team
              </MenuItem>
                <MenuItem divider />
              <MenuItem eventKey="6">Sign Out</MenuItem>
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
