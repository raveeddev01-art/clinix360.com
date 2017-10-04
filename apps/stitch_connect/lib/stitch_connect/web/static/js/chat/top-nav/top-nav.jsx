import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Dropdown from "react-bootstrap/lib/Dropdown";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import NavItemFavorite from "./nav-items/nav-item-favorite";
import NavItemMembers from "./nav-items/nav-item-members";
import NavItemNotifications from "./nav-items/nav-item-notifications";
import NavItemRename from "./nav-items/nav-item-rename";
import NavItemConvert from "./nav-items/nav-item-convert";
import GroupName from "./group-name";
import DotOptions from "./dot-options";

@inject("addonStore", "groupStore", "searchStore")
@observer
class TopNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ""
    };
    this.search = _.debounce(this.props.searchStore.searchMessages, 300);
  }

  _toggleAddonMenu = menuName => () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel(menuName);
    addonStore.toggleAddons(true);
  };

  handleLeave = () => {
    this.props.groupStore.leave();
  };

  onChange = event => {
    this.setState({ query: event.target.value });
    this.search(event.target.value);
  };

  onSearch = event => {
    event.preventDefault();
    this.props.addonStore.setAddonPanel("search");
    this.props.addonStore.toggleAddons(true);
    this.search(this.state.query);
  };

  renderClearButton = () => {
    if (this.state.query.length > 0) {
      return (
        <a onClick={this.clearSearch}>
          <i className="fa fa-times-circle-o" />
        </a>
      );
    }
  };

  clearSearch = event => {
    event.preventDefault;
    this.setState({ query: "" });
  };

  loadMore = () => {
    this.search();
  };

  render() {
    return (
      <div className="flex-header main-header">
        <div className="header-content">
          <GroupName />
        </div>

        <div className="header-nav">
          {this.props.groupStore.groupType !== "single-dm" && (
            <Dropdown id="dropdown-group-controls" pullRight>
              <Dropdown.Toggle noCaret>
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip id="tooltip-settings">Settings</Tooltip>}
                >
                  <i className="fa fa-cog" />
                </OverlayTrigger>
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
          )}

          <a
            role="link"
            className="btn btn-default"
            onClick={this._toggleAddonMenu("Room Information")}
          >
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-info">Room Information</Tooltip>}
            >
              <i className="fa fa-info-circle" />
            </OverlayTrigger>
          </a>

          <Form onSubmit={this.onSearch}>
            <i className="fa fa-search" />
            <FormControl
              type="text"
              ref="search"
              placeholder="Search"
              onChange={this.onChange}
              value={this.state.query}
            />

            {this.renderClearButton()}
          </Form>

          <DotOptions />
        </div>
      </div>
    );
  }
}

export default TopNav;
