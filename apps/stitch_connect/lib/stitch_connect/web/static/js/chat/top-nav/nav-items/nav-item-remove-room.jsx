import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { confirm } from "common/modals";

@inject("groupsStore")
@observer
export default class NavItemRemoveRoom extends Component {
  removeRoom = () => {
    confirm({
      title: "Remove Room",
      message:
        "Are you sure you want to delete the room? All of the room's messages will be removed from Stitch immediately. This cannot be undone.",
      okLabel: "Remove"
    })
      .then(() => {
        const { groupsStore } = this.props;

        groupsStore.removeRoom(groupsStore.currentGroupId);
      })
      .catch(() => {
        // do nothing
      });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return <MenuItem onClick={this.removeRoom}>Remove Room</MenuItem>;
  }
}
