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
import NavItemLeave from "./nav-items/nav-item-leave";
import NavItemHide from "./nav-items/nav-item-hide";
import GroupName from "./group-name";
import DotOptions from "./dot-options";

@inject("addonStore", "groupStore", "searchStore", "sidemenuStore")
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

    if (addonStore.addonPanelType === menuName && addonStore.showAddons) {
      addonStore.toggleAddons(false);
    } else {
      addonStore.setAddonPanel(menuName);
      addonStore.toggleAddons(true);
    }
  };

  onChange = event => {
    this.setState({ query: event.target.value });
    this.search(event.target.value);
  };

  handleJoin = () => {
    const { groupStore: group, sidemenuStore } = this.props;
    group.join();
    sidemenuStore.loadGroups();

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  renderRoomControls = () => {
    const isNotDM = this.props.groupStore.groupType === "group";
    const isDefault = this.props.groupStore.isDefault;

    if (this.props.groupStore.joined) {
      return (
        <div>
          <NavItemFavorite />
          {isNotDM && !isDefault && <NavItemMembers />}
          {isNotDM && <NavItemNotifications />}
          {isNotDM && <NavItemRename />}
          {isNotDM && !isDefault && <NavItemConvert />}
          {isNotDM && !isDefault && <NavItemLeave />}
          {!isDefault && !isNotDM && <NavItemHide />}
        </div>
      );
    }

    return (
      <div>
        <MenuItem onSelect={this.handleJoin}>
          Join <strong>#{this.props.groupStore.slug}</strong>
        </MenuItem>
      </div>
    );
  };

  onSearch = event => {
    event.preventDefault();
    this.props.addonStore.setAddonPanel("Search Results");
    this.props.addonStore.toggleAddons(true);
    this.search(this.state.query);
  };

  renderClearButton = () => {
    return this.state.query.length > 0 ? (
      <a onClick={this.clearSearch}>
        <i className="fa fa-times-circle-o" />
      </a>
    ) : null;
  };

  clearSearch = event => {
    event.preventDefault();
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
          <Dropdown
            id="dropdown-room-controls"
            pullRight
            rootCloseEvent="click"
          >
            <Dropdown.Toggle noCaret>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-settings">Settings</Tooltip>}
              >
                <i className="fa fa-cog" />
              </OverlayTrigger>
            </Dropdown.Toggle>

            <Dropdown.Menu className="room-controls-menu">
              {this.renderRoomControls()}
            </Dropdown.Menu>
          </Dropdown>

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
