import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import debounce from "lodash/debounce";

import Dropdown from "react-bootstrap/lib/Dropdown";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import { isFullMember } from "lib/utils";

import NavItemFavorite from "./nav-items/nav-item-favorite";
import NavItemInvite from "./nav-items/nav-item-invite";
import NavItemRemove from "./nav-items/nav-item-remove";
import NavItemNotifications from "./nav-items/nav-item-notifications";
import NavItemRename from "./nav-items/nav-item-rename";
import NavItemConvert from "./nav-items/nav-item-convert";
import NavItemLeave from "./nav-items/nav-item-leave";
import NavItemHide from "./nav-items/nav-item-hide";
import GroupName from "./group-name";
import DotOptions from "./dot-options";

@inject("addonStore", "groupStore", "groupsStore", "searchStore")
@observer
class TopNav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: ""
    };

    this.debouncedSearch = debounce(query => {
      props.searchStore.setQuery(query);
    }, 500);
  }

  onSearch = event => {
    event.preventDefault();

    const { addonStore } = this.props;

    addonStore.setAddonPanel("Search Results");
    addonStore.toggleAddons(true);
  };

  onSearchQueryChange = event => {
    this.setState({ query: event.target.value });
    this.debouncedSearch(event.target.value);
  };

  onToggleSettings = isOpen => {
    if (isOpen) {
      this.settingsOverlay.hide();
    }
  };

  onRoomInfoClick = () => {
    this.roomInfoOverlay.hide();

    this._toggleAddonMenu("Room Information")();
  };

  handleJoin = () => {
    const { groupStore, groupsStore } = this.props;

    groupStore.join();
    groupsStore.loadGroups();

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  _toggleAddonMenu = menuName => () => {
    const { addonStore } = this.props;

    if (addonStore.addonPanelType === menuName && addonStore.showAddons) {
      addonStore.toggleAddons(false);
    } else {
      addonStore.setAddonPanel(menuName);
      addonStore.toggleAddons(true);
    }
  };

  clearSearch = event => {
    const { searchStore } = this.props;

    event.preventDefault();

    this.setState({ query: "" });
    searchStore.reset();
  };

  renderRoomControls = () => {
    const { groupStore } = this.props;
    const isNotDM = groupStore.group.type === "regular";
    const isDefault = groupStore.group.is_default;
    const fullMember = isFullMember(currentUser);

    if (groupStore.group.joined) {
      return (
        <div>
          <NavItemFavorite />
          {fullMember && isNotDM && !isDefault && <NavItemInvite />}
          {fullMember && isNotDM && !isDefault && <NavItemRemove />}
          {isNotDM && <NavItemNotifications />}
          {fullMember && isNotDM && <NavItemRename />}
          {fullMember && isNotDM && !isDefault && <NavItemConvert />}
          {fullMember && isNotDM && !isDefault && <NavItemLeave />}
          {fullMember && !isDefault && !isNotDM && <NavItemHide />}
        </div>
      );
    }

    return (
      <div>
        <MenuItem onSelect={this.handleJoin}>
          Join <strong>#{groupStore.group.slug}</strong>
        </MenuItem>
      </div>
    );
  };

  renderClearButton = () => {
    return this.state.query.length > 0 ? (
      <a onClick={this.clearSearch}>
        <i className="fa fa-times-circle-o" />
      </a>
    ) : null;
  };

  render() {
    return (
      <div className="flex-header main-header">
        <div className="header-content">
          <Dropdown
            id="title-dropdown-room-controls"
            rootCloseEvent="click"
            onToggle={this.onToggleSettings}
          >
            <Dropdown.Toggle noCaret className="title-dropdown-toggle">
              <GroupName />
            </Dropdown.Toggle>
            <Dropdown.Menu className="room-controls-menu">
              {this.renderRoomControls()}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="header-nav">
          <Dropdown
            id="dropdown-room-controls"
            pullRight
            rootCloseEvent="click"
            onToggle={this.onToggleSettings}
          >
            <Dropdown.Toggle noCaret>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-settings">Settings</Tooltip>}
                ref={ref => {
                  this.settingsOverlay = ref;
                }}
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
            onClick={this.onRoomInfoClick}
          >
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-info">Room Information</Tooltip>}
              ref={ref => {
                this.roomInfoOverlay = ref;
              }}
            >
              <i className="fa fa-info-circle" />
            </OverlayTrigger>
          </a>

          <Form onSubmit={this.onSearch}>
            <i className="fa fa-search" />
            <FormControl
              type="text"
              placeholder="Search"
              onChange={this.onSearchQueryChange}
              value={this.state.query}
            />

            {this.renderClearButton()}
          </Form>

          <DotOptions toggleAddonMenu={this._toggleAddonMenu} />
        </div>
      </div>
    );
  }
}

export default TopNav;
