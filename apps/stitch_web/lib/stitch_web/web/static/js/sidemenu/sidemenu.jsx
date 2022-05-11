import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter, NavLink } from "react-router-dom";
import cx from "classnames";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Dropdown from "react-bootstrap/lib/Dropdown";

import { Scrollbar, Avatar } from "common/components";
import InviteModal from "common/modals/invite-modal";
import FavoritesList from "./favorites/favorites_list";
import RoomsList from "./rooms/rooms_list";
import PeopleList from "./people/people_list";
import { isMemberOrAdmin } from "../lib/utils";
import { ROOM_MENU_ITEM_ANCHOR_PREFIX } from "../lib/constants";
import { Element } from "react-scroll";

@inject("presenceStore", "sidemenuStore", "userStore", "groupsStore", "usersStore")
@observer
class Sidemenu extends Component {
  componentDidMount() {
    const { sidemenuStore } = this.props;
    sidemenuStore.loadSidemenuDiv(this.scrollbar);
  }

  componentWillUnmount() {
    const { sidemenuStore } = this.props;

    sidemenuStore.unloadSidemenuDiv();
  }

  onDropdownToggle = isDropdownOpen => {
    if (isDropdownOpen) {
      this.overlayTrigger.hide();
    }
  };

  getEdgeBadgeClass(roomItem, direction) {
    return cx(
      "edge-badge",
      {
        "edge-badge--mentions":
          (roomItem.type === "dm" || roomItem.type === "multi_dm") &&
          (roomItem.unread_messages_count || roomItem.mentions_count),
        "edge-badge--unreads":
          roomItem.type === "regular" && !roomItem.mentions_count
      },
      direction
    );
  }

  get invitesModalIsOpen() {
    return this.props.sidemenuStore.currentModal === "invites";
  }

  toggleInviteModal = () => {
    if (this.invitesModalIsOpen) {
      this.props.sidemenuStore.closeModal();
    } else {
      this.props.sidemenuStore.setModal("invites");
    }
  };

  showInviteModal = evt => {
    evt.preventDefault();
    this.toggleInviteModal();
  };

  renderMenuItem(url, text, eventKey) {
    return (
      <MenuItem eventKey={eventKey} href={url} target="_blank">
        {text}
      </MenuItem>
    );
  }

  renderAdminOptions() {
    return (
      <div>
        <div className="separator text-center">
          <span>Admin</span>
        </div>
        {this.renderMenuItem("/admin/team/settings", "Settings", "4")}
        {this.renderMenuItem("/admin/team/security", "Security", "5")}
        {this.renderMenuItem("/admin/analytics", "Analytics", "6")}
        {this.renderMenuItem("/admin/members", "Members", "7")}
        {(!window.electronApp || window.electronEnv !== "store") &&
          this.renderMenuItem("/admin/billing", "Billing", "8")}
      </div>
    );
  }

  renderUnreadBadgesUp() {
    const { sidemenuStore } = this.props;
    const roomItem = sidemenuStore.unreadRoomItemHiddenUp;

    if (!roomItem) {
      return null;
    }

    const text = roomItem.mentions_count > 0 ? "More Mentions" : "More Unreads";
    const className = this.getEdgeBadgeClass(roomItem, "up");

    return (
      <div
        className={className}
        role="link"
        onClick={() => sidemenuStore.scrollToRoomItem(roomItem.id)}
      >
        <span>{text}</span>&nbsp;&nbsp;<i className="fa fa-arrow-up" />
      </div>
    );
  }

  renderUnreadBadgesDown() {
    const { sidemenuStore } = this.props;
    const roomItem = sidemenuStore.unreadRoomItemHiddenDown;

    if (!roomItem) {
      return null;
    }

    const text = roomItem.mentions_count > 0 ? "More Mentions" : "More Unreads";
    const className = this.getEdgeBadgeClass(roomItem, "down");

    return (
      <div
        className={className}
        role="link"
        onClick={() => sidemenuStore.scrollToRoomItem(roomItem.id)}
      >
        <span>{text}</span>&nbsp;&nbsp;<i className="fa fa-arrow-down" />
      </div>
    );
  }

  render() {
    const { sidemenuStore, userStore, usersStore, groupsStore } = this.props;
    const filterJoined = rooms => rooms.filter(room => room.joined);
    const user = usersStore.getUserById(userStore.id);

    return (
      <div id="sidemenu">
        <div className="flex-header">
          <div className="team-user">
            <div className="team-name">{sidemenuStore.teamName}</div>
            <div className="user-name">
              <span className="user-name__status-icon">
                <i className="fa fa-circle" />
              </span>
              <span className="user-name__text">{userStore.fullName}</span>
            </div>
          </div>
          <Dropdown
            id="dropdown-preferences-menu"
            pullRight
            componentClass="div"
            onToggle={this.onDropdownToggle}
          >
            <Dropdown.Toggle noCaret bsStyle="link">
              <OverlayTrigger
                ref={ref => {
                  this.overlayTrigger = ref;
                }}
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-preferences">Preferences</Tooltip>
                }
              >
                <i className="fa fa-chevron-down dropdown-chevron"/>
              </OverlayTrigger>
            </Dropdown.Toggle>

            <Dropdown.Menu className="super-colors">
              <div className="user-header m-b-20">
                <Avatar
                  hideProfileDropDown={true}
                  user={user}
                  size="sm"
                />

                <div className="content">
                  <div className="full-name">{userStore.fullName}</div>
                  <div className="username text-muted">
                    {userStore.username}
                  </div>
                </div>
              </div>

              <div className="separator text-center">
                <span>You</span>
              </div>
              {this.renderMenuItem("/admin/you/account", "Account", "1")}
              {this.renderMenuItem("/admin/you/profile", "Profile", "2")}
              {this.renderMenuItem(
                "/admin/you/notifications",
                "Notifications",
                "3"
              )}

              {isMemberOrAdmin() &&
                this.renderMenuItem("/admin/integrations", "Integrations", "9")}
              {userStore.isAdmin && this.renderAdminOptions()}

              <div className="separator text-center">
                <span>InvoChat</span>
              </div>

              {userStore.canInvite && (
                <MenuItem eventKey="9" onClick={this.showInviteModal}>
                  Invite
                </MenuItem>
              )}
              <MenuItem eventKey="10" onClick={this.props.presenceStore.lock}>
                Lock Out
              </MenuItem>
              <MenuItem eventKey="11" href="/logout">
                Sign Out
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="flex-content">
          <div className="rooms-menu">
            <Scrollbar
              className="scrollbar"
              viewRef={ref => {
                this.scrollbar = ref;
              }}
            >
              <div className="rooms-menu__scroll-wrap">
              <div className="menu-nav m-b-20">
                <Element name={`${ROOM_MENU_ITEM_ANCHOR_PREFIX}threads`}>
                  <NavLink
                    to="/threads"
                    className="item"
                    activeClassName="active"
                  >
                    <div className="item-icon">
                      <i className="fa fa-comment" />
                    </div>
                    <div className="item-text">Threads</div>
                  </NavLink>
                </Element>
              </div>
                <FavoritesList
                  heading={"Favorites"}
                  rooms={groupsStore.favoriteGroups}
                />

                <RoomsList
                  heading="Rooms"
                  rooms={filterJoined(groupsStore.nonFavoritedRegularGroups)}
                />

                <PeopleList
                  heading="Direct Messages"
                  rooms={filterJoined(groupsStore.directGroups)}
                  showInviteModal={this.showInviteModal}
                />

                <InviteModal
                  show={this.invitesModalIsOpen}
                  toggle={this.toggleInviteModal}
                />
              </div>
            </Scrollbar>

            {this.renderUnreadBadgesUp()}
            {this.renderUnreadBadgesDown()}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Sidemenu);
