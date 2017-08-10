import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

import NavItemFavorite from "./nav-items/nav-item-favorite.jsx";
import NavItemMembers from "./nav-items/nav-item-members.jsx";
import NavItemNotifications from "./nav-items/nav-item-notifications.jsx";
import NavItemRename from "./nav-items/nav-item-rename.jsx";
import NavItemConvert from "./nav-items/nav-item-convert.jsx";

@inject("addonStore", "groupStore")
@observer
class TopNav extends Component {
  _toggleAddons = () => {
    this.props.addonStore.toggleAddons();
  };

  handleLeave = () => {
    this.props.groupStore.leave();
  };

  render() {
    return (
      <div className="flex-header main-header">
        <div className="header-content">
          <h4>
            <i className="fa fa-comments" /> {this.props.groupStore.name}{" "}
            <small>#{this.props.groupStore.slug}</small>
          </h4>
        </div>

        <div className="header-nav">
          <Dropdown id="dropdown-group-controls" pullRight>
            <Dropdown.Toggle noCaret>
              <i className="fa fa-cog" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="group-controls-menu">
              <NavItemFavorite />
              <NavItemMembers />
              <NavItemNotifications />
              <NavItemRename />
              <NavItemConvert />

              <MenuItem onSelect={this.handleLeave}>Leave</MenuItem>
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
