import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";

@observer
@inject("groupStore")
export default class NavItemMembers extends Component {
  _toggleFavorite = () => {
    this.props.groupStore.toggleFavorite();

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
