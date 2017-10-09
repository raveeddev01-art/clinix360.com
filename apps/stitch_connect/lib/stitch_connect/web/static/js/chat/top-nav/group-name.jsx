import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

@inject("groupStore", "presenceStore")
@observer
export default class GroupName extends Component {
  getName() {
    const { groupStore } = this.props;
    if (
      groupStore.groupType === "single-dm" &&
      groupStore.users.length === 1 &&
      groupStore.users[0].id === currentUser.id
    ) {
      return `${groupStore.name} (You)`;
    }

    return groupStore.name;
  }

  render() {
    const { groupStore, presenceStore } = this.props;
    const { groupType } = groupStore;
    const iconClassName = cx("fa", {
      "fa-comments": groupType === "group",
      "fa-link": groupType === "multi-dm",
      "fa-circle":
        groupType === "single-dm" &&
        presenceStore.isOnline(groupStore.users[0] && groupStore.users[0].id),
      "fa-circle-o":
        groupType === "single-dm" &&
        !presenceStore.isOnline(groupStore.users[0] && groupStore.users[0].id)
    });
    return (
      <h4>
        <i className={iconClassName} />
        {` ${this.getName()}`}
      </h4>
    );
  }
}
