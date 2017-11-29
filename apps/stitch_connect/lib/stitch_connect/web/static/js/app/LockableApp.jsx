import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Switch, withRouter, Route } from "react-router-dom";

import Loading from "../common/components/loading/Loading";
import LockedApp from "../locked/LockedApp";
import AdminApp from "../admin/AdminApp";
import ChatApp from "../chat/ChatApp";

@inject("presenceStore", "sidemenuStore")
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
    const { sidemenuStore, presenceStore } = this.props;

    return presenceStore.locked ? (
      <LockedApp />
    ) : sidemenuStore.loading ? (
      <Loading />
    ) : (
      <Switch>
        <Route path="/admin" component={AdminApp} />
        <Route path="/" component={ChatApp} />
      </Switch>
    );
  }
}

export default withRouter(LockableApp);
