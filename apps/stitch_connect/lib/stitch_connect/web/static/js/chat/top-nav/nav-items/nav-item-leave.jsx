import React, { Component } from "react";
import { inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { withRouter } from "react-router-dom";

@inject("groupStore", "sidemenuStore")
class NavItemLeave extends Component {
  handleLeave = () => {
    const { sidemenuStore } = this.props;

    this.props.groupStore
      .leave()
      .then(redirectTo => this.props.history.push(redirectTo));
    sidemenuStore.loadGroups();

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return <MenuItem onSelect={this.handleLeave}>Leave</MenuItem>;
  }
}
export default withRouter(NavItemLeave);
