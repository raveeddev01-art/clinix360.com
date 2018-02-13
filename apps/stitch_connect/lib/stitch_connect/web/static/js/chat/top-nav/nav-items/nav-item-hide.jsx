import React, { Component } from "react";
import { inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { withRouter } from "react-router-dom";

@inject("groupStore", "groupsStore")
class NavItemHide extends Component {
  handleHide = () => {
    const { groupStore, groupsStore } = this.props;

    groupStore.hide().then(() => {
      groupsStore.loadGroups();
    });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return <MenuItem onSelect={this.handleHide}>Close Conversation</MenuItem>;
  }
}
export default withRouter(NavItemHide);
