import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";

export default class Room extends Component {
  render() {
    const {
      slug,
      name,
      unread_messages_count: unreadMessagesCount,
      mentions_count: mentionsCount
    } = this.props.room;
    const className = classNames("item", {
      "has-unread": unreadMessagesCount > 0
    });

    return (
      <NavLink
        to={`/groups/${slug}`}
        className={className}
        activeClassName="active"
      >
        <div className="item-icon">
          <i className="fa fa-comments" />
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
