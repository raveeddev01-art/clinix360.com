import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

import NavItemMembers from "./nav-items/nav-item-members.jsx";
import NavItemNotifications from "./nav-items/nav-item-notifications.jsx";
import NavItemRename from "./nav-items/nav-item-rename.jsx";
import NavItemConvert from "./nav-items/nav-item-convert.jsx";

import sidemenuStore from "../../sidemenu/sidemenu_store.js";

@inject("layoutStore")
@observer
class TopNav extends Component {
  _toggleAddons = () => {
    this.props.layoutStore.toggleAddons();
  };

  render() {
    return (
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
            className="btn btn-default"
            id="addons-toggle"
            onClick={this._toggleAddons}
          >
            <i className="fa fa-info-circle" />
          </a>

          <input type="text" className="form-control" placeholder="Search" />
        </div>
      </div>
    );
  }
}

export default TopNav;
