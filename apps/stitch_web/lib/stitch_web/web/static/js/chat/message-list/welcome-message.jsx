import React, { Component } from "react";
import moment from "moment";
import cx from "classnames";
import { inject, observer } from "mobx-react";

@inject("groupStore", "usersStore")
@observer
class WelcomeMessage extends Component {
  getIcon() {
    const { groupStore } = this.props;
    if (groupStore.group.type !== "regular") {
      return null;
    }

    const className = cx("fa", {
      "fa-comments": groupStore.group.public,
      "fa-lock": !groupStore.group.public
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
    const { groupStore } = this.props;
    const { group } = groupStore;

    return (
      <div className="welcome-message__text">
        Welcome to the {group.public ? "public" : "private"} room
        <span className="welcome-message__name">
          {this.getIcon()}
          {` ${groupStore.groupName}`}
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
    const { groupStore } = this.props;
    let userNameText = [];

    if (groupStore.isLastMember) {
      return (
        <div className="welcome-message__text">
          This is a private place for you to work, upload personal files, track
          tasks or take notes.
        </div>
      );
    }

    groupStore.group.users.forEach((u, index) => {
      const name = this.getUserFullName(u);

      const nameText = <span className="welcome-message__name">{name}</span>

      if (index === 0) {
        userNameText.push(nameText)
      } else if (index === groupStore.group.users.length - 1) {
        userNameText.push(' and ', nameText)
      } else {
        userNameText.push(', ', nameText)
      }

    });

    return (
      <div className="welcome-message__text">
        Welcome to the private conversation between {userNameText}
      </div>
    );
  }

  renderWelcomeMessage() {
    const { groupStore } = this.props;
    const { group } = groupStore;

    return (
      <div className="welcome-message__container">
        <div className="welcome-message__title">
          <h3>
            <span>
              {this.getIcon()}
              {` ${groupStore.groupName}`}
            </span>
          </h3>
        </div>
        {group.type === "regular" ? this.renderForRoom() : this.renderForDM()}
      </div>
    )
  }

  render() {
    const { groupStore } = this.props;

    return (
      <div className="welcome-message">
        {groupStore.groupName != "Threads" && this.renderWelcomeMessage()}
      </div>
    );
  }
}

export default WelcomeMessage;
