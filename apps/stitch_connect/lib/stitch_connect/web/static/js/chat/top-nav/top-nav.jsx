import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Dropdown from "react-bootstrap/lib/Dropdown";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import MenuItem from "react-bootstrap/lib/MenuItem";

import NavItemFavorite from "./nav-items/nav-item-favorite";
import NavItemMembers from "./nav-items/nav-item-members";
import NavItemNotifications from "./nav-items/nav-item-notifications";
import NavItemRename from "./nav-items/nav-item-rename";
import NavItemConvert from "./nav-items/nav-item-convert";
import GroupName from "./group-name";
import DotOptions from "./dot-options";

@inject("addonStore", "groupStore")
@observer
class TopNav extends Component {
  _toggleAddonMenu = menuName => () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel(menuName);
    addonStore.toggleAddons(true);
  };

  handleLeave = () => {
    this.props.groupStore.leave();
  };

  handleSubmit = event => {
    event.preventDefault();
    this._toggleAddonMenu("search");
    console.log("Stopped form submition");
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
            onClick={this._toggleAddonMenu("Room Information")}
          >
            <i className="fa fa-info-circle" />
          </a>

          <a
            role="link"
            className="btn btn-default"
            onClick={this._toggleAddonMenu("search")}
          >
            <i className="fa fa-search" />
          </a>

          <Form onSubmit={this.handleSubmit}>
            <FormControl
              type="text"
              placeholder="Enter text"
              onChange={this.handleChange}
            />
          </Form>

          <a
            role="link"
            className="btn btn-default"
            onClick={this._toggleAddonMenu("search")}
          >
            <i className="fa fa-star" />
          </a>

          <DotOptions />
        </div>
      </div>
    );
  }
}

export default TopNav;
