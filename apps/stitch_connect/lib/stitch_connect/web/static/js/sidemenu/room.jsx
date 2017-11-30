import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import { Element } from "react-scroll";
import VisibilitySensor from "react-visibility-sensor";
import classNames from "classnames";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import { ROOM_MENU_ITEM_ANCHOR_PREFIX } from "../lib/constants";

@inject("presenceStore", "sidemenuStore", "groupsStore")
@observer
class Room extends Component {
  onVisibleChange = isVisible => {
    const { sidemenuStore, room } = this.props;

    if (isVisible) {
      sidemenuStore.onRoomMenuItemShow(room.id);
    } else {
      sidemenuStore.onRoomMenuItemHide(room.id);
    }
  };

  getIconClass() {
    const { presenceStore, room } = this.props;
    let iconClass;

    if (room.type === "regular" && room.public === false) {
      iconClass = "fa-lock";
    } else if (room.type === "regular") {
      iconClass = "fa-comments";
    } else if (room.type === "dm") {
      const otherUser = room.users.find(user => user.id !== currentUser.id);
      iconClass =
        !otherUser || presenceStore.isOnline(otherUser.id)
          ? "fa-circle"
          : "fa-circle-o";
    } else {
      iconClass = "fa-link";
    }

    return classNames("fa", iconClass);
  }

  getName() {
    const { room } = this.props;

    if (
      room.type === "dm" &&
      room.users.length === 1 &&
      room.users[0].id === currentUser.id
    ) {
      return `${room.name} (You)`;
    }

    return room.name;
  }

  getBadge() {
    const {
      type,
      unread_messages_count: unreadMessagesCount,
      mentions_count: mentionsCount
    } = this.props.room;

    return type === "regular" ? mentionsCount : unreadMessagesCount;
  }

  getHideDMIcon() {
    const { type } = this.props.room;

    return (
      type !== "regular" && (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="hide-dm">Hide Conversation</Tooltip>}
        >
          <span role="button" className="hide-dm" onClick={this.hideDM}>
            <i className="fa fa-minus-square-o" />
          </span>
        </OverlayTrigger>
      )
    );
  }

  hideDM = event => {
    event.preventDefault();

    const { groupsStore, room, history } = this.props;

    groupsStore.hideGroup(room.id).then(() => {
      groupsStore.loadGroups();
      history.push(`/rooms/${groupsStore.defaultGroup.slug}`); // when room is hidden, should redirect to general
    });
  };

  render() {
    const { room, sidemenuStore, groupsStore } = this.props;
    const roomUrl = groupsStore.getGroupUrl(room.id);
    const className = classNames("item", {
      "has-unread": room.unread_messages_count > 0
    });
    const badge = this.getBadge();
    const anchorName = `${ROOM_MENU_ITEM_ANCHOR_PREFIX}${room.id}`;

    return (
        <VisibilitySensor
          active
          onChange={this.onVisibleChange}
          scrollCheck
          partialVisibility
          intervalCheck={false}
          scrollThrottle={100}
          containment={sidemenuStore.sidemenuDiv}
        >
          <Element name={anchorName}>
            <NavLink
              to={roomUrl}
              className={className}
              activeClassName="active"
            >
              <div className="item-icon">
                <i className={this.getIconClass()} />
              </div>
              <div className="item-text">{this.getName()}</div>
              {this.getHideDMIcon()}
              {badge > 0 && (
                <div className="item-badge text-center">
                  {badge < 10 ? badge : "9+"}
                </div>
              )}
            </NavLink>
          </Element>
        </VisibilitySensor>
      )
    );
  }
}

Room.propTypes = {
  room: PropTypes.object.isRequired
};

export default withRouter(Room);
