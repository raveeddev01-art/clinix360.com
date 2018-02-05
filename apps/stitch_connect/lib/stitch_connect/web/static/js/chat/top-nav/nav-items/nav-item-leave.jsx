import React, { Component } from "react";
import { inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { withRouter } from "react-router-dom";

@inject("groupStore", "groupsStore")
class NavItemLeave extends Component {
  handleLeave = () => {
    const { groupStore, groupsStore, history } = this.props;

    groupStore.leave().then(redirectTo => {
      groupsStore.loadGroups();
      history.push(redirectTo);
    });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return <MenuItem onSelect={this.handleLeave}>Leave Room</MenuItem>;
  }
}
export default withRouter(NavItemLeave);
