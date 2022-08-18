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
class ThreadsTopNav extends Component {

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

  render() {

    return (
      <div className="flex-header main-header">
        <div className="header-content">
          <Dropdown
            id="title-dropdown-room-controls"
            rootCloseEvent="click"
          >
            <Dropdown.Toggle noCaret className="title-dropdown-toggle">
              <GroupName />
            </Dropdown.Toggle>
            <Dropdown.Menu className="room-controls-menu"></Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="header-nav">

          <SearchInput />

          <DotOptions toggleAddonMenu={this._toggleAddonMenu} />
        </div>
      </div>
    );
  }
}

export default ThreadsTopNav;
