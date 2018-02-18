import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import cx from "classnames";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Dropdown from "react-bootstrap/lib/Dropdown";

import { Scrollbar } from "common/components";
import InviteModal from "common/modals/invite-modal";
import FavoritesList from "./favorites/favorites_list";
import RoomsList from "./rooms/rooms_list";
import PeopleList from "./people/people_list";

@inject("presenceStore", "sidemenuStore", "userStore", "groupsStore")
@observer
class Sidemenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInviteModal: false
    };
  }

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

  toggleInviteModal = () => {
    this.setState({
      showInviteModal: !this.state.showInviteModal
    });
  };

  showInviteModal = evt => {
    evt.preventDefault();
    this.toggleInviteModal();
  };

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
        <LinkContainer to="/admin/billing">
          <MenuItem eventKey="8">Billing</MenuItem>
        </LinkContainer>
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
                <i className="fa fa-chevron-down" />
              </OverlayTrigger>
            </Dropdown.Toggle>

            <Dropdown.Menu className="super-colors">
              <h5 className="text-center">{`${currentUser.firstName} ${currentUser.lastName}`}</h5>

              <div className="separator text-center">
                <span>You</span>
              </div>
              <LinkContainer to="/admin/you/account">
                <MenuItem eventKey="1">Account</MenuItem>
              </LinkContainer>
              <LinkContainer to="/admin/you/profile">
                <MenuItem eventKey="2">Profile</MenuItem>
              </LinkContainer>
              <LinkContainer to="/admin/you/notifications">
                <MenuItem eventKey="3">Notifications</MenuItem>
              </LinkContainer>

              {userStore.isAdmin && this.renderAdminOptions()}

              <div className="separator text-center">
                <span>Stitch</span>
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
                <FavoritesList
                  heading={"Favorites"}
                  rooms={groupsStore.favoriteGroups}
                />

                <RoomsList
                  heading="Rooms"
                  rooms={filterJoined(groupsStore.normalGroups)}
                />

                <PeopleList
                  heading="Direct Messages"
                  rooms={filterJoined(groupsStore.directGroups)}
                  showInviteModal={this.showInviteModal}
                />

                <InviteModal
                  show={this.state.showInviteModal}
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
