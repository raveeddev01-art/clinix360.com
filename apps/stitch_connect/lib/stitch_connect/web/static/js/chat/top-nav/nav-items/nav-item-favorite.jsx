import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";

@inject("groupStore")
@observer
export default class NavItemMembers extends Component {
  _toggleFavorite = () => {
    const { groupStore } = this.props;

    groupStore.toggleFavorite();

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    const { groupStore } = this.props;

    return (
      <MenuItem onClick={this._toggleFavorite}>
        {groupStore.group.is_favorite ? "Unfavorite" : "Favorite"}
      </MenuItem>
    );
  }
}
