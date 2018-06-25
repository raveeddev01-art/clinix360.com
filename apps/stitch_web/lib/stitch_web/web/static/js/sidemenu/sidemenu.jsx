import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
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

@inject("presenceStore", "sidemenuStore", "userStore", "groupsStore")
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

  renderIntegrationLink() {
    return window.electronApp ? (
      <MenuItem eventKey="9" href="/admin/integrations" target="_blank">
        Integrations
        <small className="text-muted m-l-5">
          <i className="fa fa-external-link sm" />
        </small>
      </MenuItem>
    ) : (
      <LinkContainer to="/admin/integrations">
        <MenuItem eventKey="9">Integrations</MenuItem>
      </LinkContainer>
    );
  }

  renderAdminOptions() {
    return (
      <div>
        <div className="separator text-center">
          <span>Admin</span>
        </div>
        <LinkContainer to="/admin/team/settings">
          <MenuItem eventKey="4">Settings</MenuItem>
        </LinkContainer>
        <LinkContainer to="/admin/team/security">
          <MenuItem eventKey="5">Security</MenuItem>
        </LinkContainer>
        <LinkContainer to="/admin/analytics">
          <MenuItem eventKey="6">Analytics</MenuItem>
        </LinkContainer>
        <LinkContainer to="/admin/members">
          <MenuItem eventKey="7">Members</MenuItem>
        </LinkContainer>
        {(!window.electronApp || window.electronEnv !== "store") && (
            <LinkContainer to="/admin/billing">
              <MenuItem eventKey="8">Billing</MenuItem>
            </LinkContainer>
          )}
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
    const { sidemenuStore, userStore, groupsStore } = this.props;
    const filterJoined = rooms => rooms.filter(room => room.joined);

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
