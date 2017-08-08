import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

import NavItemMembers from "./nav-items/nav-item-members.jsx";
import NavItemNotifications from "./nav-items/nav-item-notifications.jsx";
import NavItemRename from "./nav-items/nav-item-rename.jsx";
import NavItemConvert from "./nav-items/nav-item-convert.jsx";

@inject("groupStore")
@observer
export default class TopNav extends Component {
  constructor(props) {
    super(props);
  }

  handleLeave = () => {
    this.props.groupStore.leave();
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

              <MenuItem onSelect={this.handleLeave}>Leave</MenuItem>
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
    );
  }
}
