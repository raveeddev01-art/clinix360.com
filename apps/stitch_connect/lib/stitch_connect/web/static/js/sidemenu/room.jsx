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
    }

    return `/direct/${dmUsers.map(user => user.username).join(",")}`;
  }

  getIconClass() {
    const { presenceStore } = this.props;
    const { type, users } = this.props.room;
    let iconClass;

    if (type === "regular") {
      iconClass = "fa-comments";
    } else if (type === "dm") {
      let otherUser = users.find(user => user.id !== currentUser.id);
      iconClass = presenceStore.isOnline(otherUser.id)
        ? "fa-circle"
        : "fa-circle-o";
    } else {
      iconClass = "fa-link";
    }

    return classNames("fa", iconClass);
  }

  render() {
    const {
      name,
      unread_messages_count: unreadMessagesCount,
      mentions_count: mentionsCount
    } = this.props.room;
    const className = classNames("item", {
      "has-unread": unreadMessagesCount > 0
    });

    return (
      <NavLink
        to={this.getNavLink()}
        className={className}
        activeClassName="active"
      >
        <div className="item-icon">
          <i className={this.getIconClass()} />
        </div>
        <div className="item-text">
          {name}
        </div>
        {mentionsCount > 0 &&
          <div className="item-badge text-center">
            {mentionsCount}
          </div>}
      </NavLink>
    );
  }
}

export default withRouter(Room);
