import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import classNames from "classnames";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("presenceStore", "sidemenuStore")
@observer
class Room extends Component {
  getNavLink() {
    const { slug, type, users } = this.props.room;

    if (type === "regular") {
      return `/rooms/${slug}`;
    }

    let dmUsers = users;
    if (type === "dm") {
      dmUsers = users.filter(user => user.id !== currentUser.id);
      dmUsers = dmUsers.length ? dmUsers : [currentUser];
    }

    return `/direct/${dmUsers.map(user => user.username).join(",")}`;
  }

  getIconClass() {
    const { presenceStore } = this.props;
    const { type, users } = this.props.room;
    let iconClass;

    if (type === "regular" && this.props.room.public === false) {
      iconClass = "fa-lock";
    } else if (type === "regular") {
      iconClass = "fa-comments";
    } else if (type === "dm") {
      let otherUser = users.find(user => user.id !== currentUser.id);
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
    if (type !== "regular") {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="hide-dm">Hide Conversation</Tooltip>}
        >
          <span role="button" className="hide-dm" onClick={this.hideDM}>
            <i className="fa fa-minus-square-o" />
          </span>
        </OverlayTrigger>
      );
    }
  }

  hideDM = event => {
    event.preventDefault();
    const { sidemenuStore } = this.props;
    sidemenuStore.hideGroup(this.props.room.id).then(() => {
      sidemenuStore.loadGroups();
    });
  };

  render() {
    const {
      unread_messages_count: unreadMessagesCount,
      type: roomType,
      is_hidden: isHidden
    } = this.props.room;
    const className = classNames("item", {
      "has-unread": unreadMessagesCount > 0
    });
    const badge = this.getBadge();
    const roomHidden =
      (roomType === "dm" || roomType === "multi_dm") && isHidden;

    return (
      !roomHidden && (
        <NavLink
          to={this.getNavLink()}
          className={className}
          activeClassName="active"
        >
          <div className="item-icon">
            <i className={this.getIconClass()} />
          </div>
          <div className="item-text">{this.getName()}</div>
          {this.getHideDMIcon()}
          {badge > 0 && <div className="item-badge text-center">{badge}</div>}
        </NavLink>
      )
    );
  }
}

export default withRouter(Room);
