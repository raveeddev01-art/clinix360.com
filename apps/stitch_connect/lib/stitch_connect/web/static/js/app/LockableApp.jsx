import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Switch, withRouter } from "react-router-dom";

import AuthRoute from "./AuthRoute";
import LockedApp from "../locked/LockedApp";
import AdminApp from "../admin/AdminApp";
import ChatApp from "../chat/ChatApp";

@inject("presenceStore")
@observer
class LockableApp extends Component {
  componentDidMount() {
    const {
      onWindowFocus,
      onWindowBlur,
      getLockoutSettings
    } = this.props.presenceStore;

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);

    getLockoutSettings();
  }

  render() {
    return this.props.presenceStore.locked ? (
      <LockedApp />
    ) : (
      <Switch>
        <AuthRoute path="/admin" component={AdminApp} />
        <AuthRoute path="/" component={ChatApp} />
      </Switch>
    );
  }
}

export default withRouter(LockableApp);
