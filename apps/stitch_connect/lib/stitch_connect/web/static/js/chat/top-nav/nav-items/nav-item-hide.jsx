import React, { Component } from "react";
import { inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { withRouter } from "react-router-dom";

@inject("groupStore", "sidemenuStore")
class NavItemHide extends Component {
  handleHide = () => {
    const { sidemenuStore } = this.props;

    this.props.groupStore.hide().then(() => {
      sidemenuStore.loadGroups();
    });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return <MenuItem onSelect={this.handleHide}>Close</MenuItem>;
  }
}
export default withRouter(NavItemHide);
