import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

import NavItemFavorite from "./nav-items/nav-item-favorite";
import NavItemMembers from "./nav-items/nav-item-members";
import NavItemNotifications from "./nav-items/nav-item-notifications";
import NavItemRename from "./nav-items/nav-item-rename";
import NavItemConvert from "./nav-items/nav-item-convert";
import GroupName from "./group-name";

@inject("addonStore", "groupStore")
@observer
class TopNav extends Component {
  _toggleInfoAddon = () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("info");
    addonStore.toggleAddons();
  };

  _toggleDirectoryAddon = () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("directory");
    addonStore.toggleAddons(true);
  };

  _toggleSearchAddon = () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("search");
    addonStore.toggleAddons();
  };

  _toggleGlobalStarredMessagesAddon = () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("starred");
    addonStore.toggleAddons(true);
  };

  handleLeave = () => {
    this.props.groupStore.leave();
  };

  render() {
    return (
      <div className="flex-header main-header">
        <div className="header-content">
          <GroupName />
        </div>

        <div className="header-nav">
          {this.props.groupStore.groupType !== "single-dm" &&
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
            </Dropdown>}

          <a
            role="link"
            className="btn btn-default"
            onClick={this._toggleInfoAddon}
          >
            <i className="fa fa-info-circle" />
          </a>
          <a
            role="link"
            className="btn btn-default"
            onClick={this._toggleSearchAddon}
          >
            <i className="fa fa-search" />
          </a>

          <Dropdown id="dropdown-group-controls" pullRight>
            <Dropdown.Toggle noCaret className="more-btn">
              <i className="fa fa-ellipsis-h" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="more-menu">
              <MenuItem onSelect={this._toggleDirectoryAddon}>
                <i className="fa fa-users" /> Directory
              </MenuItem>
              <MenuItem>
                <i className="fa fa-folder-open" /> Files
              </MenuItem>
              <MenuItem>
                <i className="fa fa-at" /> Mentions
              </MenuItem>
              <MenuItem onSelect={this._toggleGlobalStarredMessagesAddon}>
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
