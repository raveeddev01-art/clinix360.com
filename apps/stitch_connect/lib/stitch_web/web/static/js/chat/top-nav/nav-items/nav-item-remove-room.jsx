import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { confirmModal } from "common/modals";

@inject("groupsStore")
@observer
export default class NavItemRemoveRoom extends Component {
  removeRoom = () => {
    confirmModal({
      title: "Remove Room",
      message:
        "Are you sure you want to delete the room? All of the room's messages will be removed from Stitch immediately. This cannot be undone.",
      okLabel: "Remove"
    })
      .then(() => {
        const { groupsStore } = this.props;

        return groupsStore.removeGroup(groupsStore.currentGroupId);
      })
      .catch(() => {
        // do nothing
      });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return <MenuItem onClick={this.removeRoom}>Delete Room</MenuItem>;
  }
}
