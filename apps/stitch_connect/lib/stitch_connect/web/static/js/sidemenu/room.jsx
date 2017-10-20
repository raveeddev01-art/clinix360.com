import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import VisibilitySensor from "react-visibility-sensor";
import classNames from "classnames";
import _ from "lodash";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("presenceStore", "sidemenuStore")
@observer
class Room extends Component {
  hideDM = event => {
    event.preventDefault();
    const { sidemenuStore } = this.props;
    sidemenuStore.hideGroup(this.props.room.id).then(() => {
      sidemenuStore.loadGroups();
    });
  };

  onVisibleChange = isVisible => {
    const { room } = this.props;

    console.log("room item visibility", room.name, isVisible);
  };

  getNavLink() {
    const { slug, type, users } = this.props.room;

    if (type === "regular") {
      return `/rooms/${slug}`;
    }

    let dmUsers = users;
    if (dmUsers.length > 1)
      dmUsers = dmUsers.filter(user => user.id !== currentUser.id);
    if (type === "dm") {
      dmUsers = dmUsers.length ? dmUsers : [currentUser];
    } else {
      dmUsers = _.sortBy(dmUsers, "id");
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
      const otherUser = users.find(user => user.id !== currentUser.id);
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

    const { type, users } = room;
    let dmUsers = users;
    if (type === "dm") {
      return room.name;
    } else if (type === "multi_dm") {
      dmUsers = users.filter(user => user.id !== currentUser.id);
      return dmUsers
        .map(user => `${user.first_name} ${user.last_name}`)
        .join(", ");
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
    const { sidemenuStore } = this.props;
    sidemenuStore.hideGroup(this.props.room.id).then(() => {
      sidemenuStore.loadGroups();
    });
  };

  render() {
    const { room, sidemenuDiv } = this.props;
    const className = classNames("item", {
      "has-unread": room.unread_messages_count > 0
    });
    const badge = this.getBadge();
    const roomHidden =
      (room.type === "dm" || room.type === "multi_dm") && room.is_hidden;

    return (
      !roomHidden && (
        <VisibilitySensor
          active
          onChange={this.onVisibleChange}
          intervalCheck={false}
          scrollCheck
          scrollThrottle={100}
          containment={sidemenuDiv}
        >
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
        </VisibilitySensor>
      )
    );
  }
}

Room.defaultProps = {
  sidemenuDiv: null
};

Room.propTypes = {
  room: PropTypes.object.isRequired,
  sidemenuDiv: PropTypes.object
};

export default withRouter(Room);
