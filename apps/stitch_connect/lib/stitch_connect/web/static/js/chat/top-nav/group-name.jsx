import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

@inject("groupStore", "presenceStore")
@observer
export default class GroupName extends Component {
  render() {
    const { groupStore, presenceStore } = this.props;
    const { type } = groupStore;
    const iconClassName = cx("fa", {
      "fa-comments": type === "regular" && groupStore.public,
      "fa-lock": type === "regular" && !groupStore.public,
      "fa-link": type === "multi_dm",
      "fa-circle":
        type === "dm" &&
        presenceStore.isOnline(groupStore.users[0] && groupStore.users[0].id),
      "fa-circle-o":
        type === "dm" &&
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
