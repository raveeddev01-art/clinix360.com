import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";

@observer
@inject("groupStore", "sidemenuStore")
export default class NavItemMembers extends Component {
  _toggleFavorite = () => {
    const { groupStore, sidemenuStore } = this.props;
    groupStore.toggleFavorite().then(favorite => {
      sidemenuStore.instance.updateGroupData(groupStore.id, { favorite });
      if (favorite) {
        notify.show(`You added ${groupStore.name} group as favorite`);
      } else {
        notify.show(`You removed ${groupStore.name} group from favorite`);
      }
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
