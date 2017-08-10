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
  _toggleInfoAddon = () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel('info');
    addonStore.toggleAddons();
  };

  _toggleDirectory = () => {
    console.log('toggleDirectory');
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
            onClick={this._toggleInfoAddon}
          >
            <i className="fa fa-info-circle" />
          </a>

          <Dropdown id="dropdown-more-controls" pullRight>
            <Dropdown.Toggle noCaret>
              <i className="fa fa-ellipsis-h" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="group-controls-menu">
              <MenuItem onSelect={this._toggleDirectory}>
                <i className="fa fa-users"></i>&nbsp;&nbsp;Directory
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>

          <input type="text" className="form-control" placeholder="Search" />

          <Dropdown id="dropdown-group-controls" pullRight>
            <Dropdown.Toggle noCaret className="more-btn">
              <i className="fa fa-ellipsis-h" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="more-menu">
              <MenuItem>
                <i className="fa fa-users" /> Directory
              </MenuItem>
              <MenuItem>
                <i className="fa fa-folder-open" /> Files
              </MenuItem>
              <MenuItem>
                <i className="fa fa-at" /> Mentions
              </MenuItem>
              <MenuItem>
                <i className="fa fa-star" /> Starred
              </MenuItem>
              <MenuItem>
                <i className="fa fa-flask" /> Labs
              </MenuItem>
              <MenuItem>
                <i className="fa fa-address-card-o" /> Referrals
              </MenuItem>
              <MenuItem>
                <i className="fa fa-check-square-o" /> Checklists
              </MenuItem>
              <MenuItem>
                <i className="fa fa-medkit" /> Prescriptions
              </MenuItem>
              <MenuItem>
                <i className="fa fa-bookmark-o" /> Clinical Notes
              </MenuItem>
              <MenuItem href="https://teamstitch.zendesk.com/hc/en-us">
                <i className="fa fa-question-circle" /> Help
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default TopNav;
