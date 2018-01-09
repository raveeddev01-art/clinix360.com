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
      throttledUserInteract,
      getLockoutSettings
    } = this.props.presenceStore;

    document.addEventListener("mousemove", throttledUserInteract);
    document.addEventListener("touchmove", throttledUserInteract);
    document.addEventListener("click", throttledUserInteract);
    document.addEventListener("keypress", throttledUserInteract);

    getLockoutSettings();
  }

  componentWillUnmount() {
    const { throttledUserInteract } = this.props.presenceStore;

    document.removeEventListener("touchmove", throttledUserInteract);
    document.removeEventListener("mousemove", throttledUserInteract);
    document.removeEventListener("click", throttledUserInteract);
    document.removeEventListener("keypress", throttledUserInteract);
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
