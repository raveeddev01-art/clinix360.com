import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

@inject("groupStore", "presenceStore")
@observer
export default class GroupName extends Component {
  render() {
    const { groupStore, presenceStore } = this.props;
    const { groupType } = groupStore;
    const iconClassName = cx("fa", {
      "fa-comments": groupType === "regular" && groupStore.public,
      "fa-lock": groupType === "regular" && !groupStore.public,
      "fa-link": groupType === "multi_dm",
      "fa-circle":
        groupType === "dm" &&
        presenceStore.isOnline(groupStore.users[0] && groupStore.users[0].id),
      "fa-circle-o":
        groupType === "dm" &&
        !presenceStore.isOnline(groupStore.users[0] && groupStore.users[0].id)
    });
    return (
      <h4>
        <span>
          <i className={iconClassName} />
          {` ${groupStore.name}`}
        </span>
      </h4>
    );
  }
}
