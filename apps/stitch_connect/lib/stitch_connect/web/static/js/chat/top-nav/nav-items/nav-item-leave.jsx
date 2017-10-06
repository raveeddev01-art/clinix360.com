import React, { Component } from "react";
import { inject } from "mobx-react";
import MenuItem from "react-bootstrap/lib/MenuItem";
import { withRouter } from "react-router-dom";

@inject("groupStore")
class NavItemLeave extends Component {
  handleLeave = () => {
    this.props.groupStore
      .leave()
      .then(redirectTo => this.props.history.push(redirectTo));
  };

  render() {
    return <MenuItem onSelect={this.handleLeave}>Leave</MenuItem>;
  }
}
export default withRouter(NavItemLeave);
