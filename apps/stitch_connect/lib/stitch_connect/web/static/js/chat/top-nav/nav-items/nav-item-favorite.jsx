import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";

@inject("groupStore", "groupsStore")
@observer
export default class NavItemMembers extends Component {
  _toggleFavorite = () => {
    const { groupStore, groupsStore } = this.props;

    groupStore.toggleFavorite().then(favorite => {
      groupsStore.updateGroupData(groupStore.group.id, { favorite });
    });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    const { favorite } = this.props.groupStore;
    return (
      <MenuItem onClick={this._toggleFavorite}>
        {favorite ? "Unfavorite" : "Favorite"}
      </MenuItem>
    );
  }
}
