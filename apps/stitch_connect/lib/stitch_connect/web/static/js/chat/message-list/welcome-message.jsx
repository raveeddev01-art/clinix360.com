import React, { Component } from "react";
import moment from "moment";
import cx from "classnames";
import { inject, observer } from "mobx-react";

@inject("groupStore", "sidemenuStore")
@observer
class WelcomeMessage extends Component {
  getIcon() {
    const { groupStore: group } = this.props;
    if (group.groupType !== "group") {
      return null;
    }

    const className = cx("fa", {
      "fa-comments": group.public,
      "fa-lock": !group.public
    });

    return <i className={className} />;
  }

  getFormattedTime(time) {
    return moment(time).format("MMMM D, YYYY");
  }

  getUserFullName(userParam) {
    const { sidemenuStore } = this.props;
    let user = userParam;
    if (typeof userParam === "number") {
      user = sidemenuStore.users.find(u => u.id === userParam);
    }

    if (!user) return "";

    if (user.id === currentUser.id) {
      return `${user.first_name} ${user.last_name} (You)`;
    }

    return `${user.first_name} ${user.last_name}`;
  }

  renderForRoom() {
    const { groupStore: group } = this.props;

    return (
      <div className="welcome-message__text">
        Welcome to the public room
        <span className="welcome-message__name">
          {this.getIcon()}
          {` ${group.name}`}
        </span>
        created by
        <span className="welcome-message__name">
          {this.getUserFullName(group.createdBy)}
        </span>
        on {this.getFormattedTime(group.createdAt)}.
      </div>
    );
  }

  renderForDM() {
    const { groupStore: group } = this.props;
    let userNameText = "";

    if (group.users.length === 1) {
      return (
        <div className="welcome-message__text">
          This is a private place for you to work, upload personal files, track
          tasks or take notes.
        </div>
      );
    }

    group.users.forEach((u, index) => {
      const name = this.getUserFullName(u);
      if (index === 0) userNameText += name;
      else if (index === group.users.length - 1) userNameText += ` and ${name}`;
      else userNameText += `, ${name}`;
    });

    return (
      <div className="welcome-message__text">
        Welcome to the private conversation between
        <span className="welcome-message__name">{userNameText}</span>
      </div>
    );
  }

  render() {
    const { groupStore: group } = this.props;

    return (
      <div className="welcome-message">
        <div className="welcome-message__container">
          <div className="welcome-message__title">
            {this.getIcon()}
            {` ${group.name}`}
          </div>
          {group.groupType === "group"
            ? this.renderForRoom()
            : this.renderForDM()}
        </div>
      </div>
    );
  }
}

export default WelcomeMessage;
