import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

@inject("groupStore", "presenceStore")
@observer
export default class GroupName extends Component {
  getUserId(users) {
    if (users[0].id === currentUser.id) {
      return users[1].id;
    }

    return users[0].id;
  }

  render() {
    const { groupStore, presenceStore } = this.props;
    const { type, users } = groupStore.group;
    let iconName;

    if (type === "regular") {
      iconName = groupStore.group.public ? "fa-comments" : "fa-lock";
    } else if (type === "dm" && users.length === 1) {
      iconName = "fa-circle";
    } else if (type === "dm" && users.length === 2) {
      iconName = presenceStore.isOnline(this.getUserId(users))
        ? "fa-circle"
        : "fa-circle-o";
    } else if (type === "multi_dm") {
      iconName = "fa-link";
    }

    return (
      <h4>
        <span>
          <i className={classNames("fa", iconName)} />
          {` ${groupStore.group.name}`}
        </span>
      </h4>
    );
  }
}
