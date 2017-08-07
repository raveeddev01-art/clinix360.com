import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";

@observer
@inject("groupStore")
export default class NavItemMembers extends Component {
  render() {
    return <MenuItem onClick={this._toggleFavorite}>Favorite</MenuItem>;
  }
}
