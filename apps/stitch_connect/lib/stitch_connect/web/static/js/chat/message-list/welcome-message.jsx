import React, { Component } from "react";
import moment from "moment";
import cx from "classnames";
import { inject, observer } from "mobx-react";

@inject("groupStore", "usersStore")
@observer
class WelcomeMessage extends Component {
  getIcon() {
    const { groupStore: group } = this.props;
    if (group.type !== "regular") {
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
    const { usersStore } = this.props;
    let user = userParam;
    if (typeof userParam === "number") {
      user = usersStore.users.find(u => u.id === userParam);
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
        Welcome to the {group.public ? "public" : "private"} room
        <span className="welcome-message__name">
          {this.getIcon()}
          {` ${group.name}`}
        </span>
        {group.creator_user_id ? " created by" : " created"}
        {group.creator_user_id && (
          <span className="welcome-message__name">
            {this.getUserFullName(group.creator_user_id)}
          </span>
        )}
        on {this.getFormattedTime(group.inserted_at)}.
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
            <h3>
              <span>
                {this.getIcon()}
                {` ${group.name}`}
              </span>
            </h3>
          </div>
          {group.type === "regular" ? this.renderForRoom() : this.renderForDM()}
        </div>
      </div>
    );
  }
}

export default WelcomeMessage;
