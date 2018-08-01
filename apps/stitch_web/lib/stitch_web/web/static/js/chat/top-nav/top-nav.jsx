import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import { isFullMember, isAdmin } from "lib/utils";

import NavItemFavorite from "./nav-items/nav-item-favorite";
import NavItemInvite from "./nav-items/nav-item-invite";
import NavItemRemoveMembers from "./nav-items/nav-item-remove-members";
import NavItemRemoveRoom from "./nav-items/nav-item-remove-room";
import NavItemNotifications from "./nav-items/nav-item-notifications";
import NavItemRename from "./nav-items/nav-item-rename";
import NavItemConvert from "./nav-items/nav-item-convert";
import NavItemLeave from "./nav-items/nav-item-leave";
import NavItemHide from "./nav-items/nav-item-hide";
import GroupName from "./group-name";
import DotOptions from "./dot-options";
import SearchInput from "./search-input";
import BrowserWindow from "../../util/windows";

@inject("addonStore", "groupStore", "groupsStore", "newsStore")
@observer
class TopNav extends Component {
  onInitCall = () => {
    const { groupStore } = this.props;
    BrowserWindow.open(`/call/init/${groupStore.group.id}`, {
      name: "calling"
    });
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

  _toggleAddonMenu = (menuName, tabName) => () => {
    const { addonStore } = this.props;

    if (menuName === "Updates") {
      this.props.newsStore.markAsRead();
    }

    if (
      addonStore.addonPanelType === menuName &&
      addonStore.showAddons &&
      addonStore.addonPanelTab === tabName
    ) {
      addonStore.toggleAddons(false);
    } else {
      addonStore.setAddonPanel(menuName);
      if (tabName) {
        addonStore.setAddonPanelTab(menuName, tabName);
      }
      addonStore.toggleAddons(true);
    }
  };

  renderRoomControls = () => {
    const { groupStore } = this.props;
    const isNotDM = groupStore.group.type === "regular";
    const isDefault = groupStore.group.is_default;
    const fullMember = isFullMember(currentUser);
    const isRoomCreator = groupStore.group.creator_user_id === currentUser.id;
    const adminOrCreator = isAdmin() || isRoomCreator;
    const isLastMember = groupStore.isLastMember;
    const publicOrPrivileged = groupStore.group.public || adminOrCreator;

    if (groupStore.group.joined) {
      return (
        <div>
          <NavItemFavorite />
          {fullMember &&
            isNotDM &&
            !isDefault &&
            publicOrPrivileged && <NavItemInvite />}
          {isNotDM && <NavItemNotifications />}
          {fullMember &&
            isNotDM &&
            !isDefault &&
            !isLastMember && <NavItemLeave />}
          {fullMember && !isDefault && !isNotDM && <NavItemHide />}
          {fullMember &&
            adminOrCreator &&
            isNotDM &&
            !isDefault &&
            !isLastMember && <NavItemRemoveMembers />}
          {fullMember && adminOrCreator && isNotDM && <NavItemRename />}
          {fullMember &&
            adminOrCreator &&
            isNotDM &&
            !isDefault && <NavItemConvert />}
          {fullMember &&
            adminOrCreator &&
            isNotDM &&
            !isDefault && <NavItemRemoveRoom />}
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

  render() {
    const { groupStore } = this.props;
    const isLastMember = groupStore.isLastMember;

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
          {!isLastMember && (
            <a
              role="link"
              className="btn btn-default"
              onClick={this.onInitCall}
            >
              <i className="fa fa-phone" />
            </a>
          )}
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

          <SearchInput />

          <DotOptions toggleAddonMenu={this._toggleAddonMenu} />
        </div>
      </div>
    );
  }
}

export default TopNav;
