import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import classNames from "classnames";

@inject("presenceStore")
@observer
class Room extends Component {
  getNavLink() {
    const { slug, type, users } = this.props.room;

    if (type === "regular") {
      return `/groups/${slug}`;
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

  getBadge() {
    const {
      type,
      unread_messages_count: unreadMessagesCount,
      mentions_count: mentionsCount
    } = this.props.room;

    return type === "regular" ? mentionsCount : unreadMessagesCount;
  }

  render() {
    const {
      name,
      unread_messages_count: unreadMessagesCount
    } = this.props.room;
    const className = classNames("item", {
      "has-unread": unreadMessagesCount > 0
    });
    const badge = this.getBadge();

    return (
      <NavLink
        to={this.getNavLink()}
        className={className}
        activeClassName="active"
      >
        <div className="item-icon">
          <i className={this.getIconClass()} />
        </div>
        <div className="item-text">{name}</div>
        {badge > 0 && <div className="item-badge text-center">{badge}</div>}
      </NavLink>
    );
  }
}

export default withRouter(Room);
