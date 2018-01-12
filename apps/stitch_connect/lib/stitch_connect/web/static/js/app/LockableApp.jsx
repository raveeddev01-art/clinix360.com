import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Switch, withRouter, Route } from "react-router-dom";

import { Loading } from "common/components";
import LockedApp from "../locked/LockedApp";
import AdminApp from "../admin/AdminApp";
import ChatApp from "../chat/ChatApp";

@inject("presenceStore", "sidemenuStore", "messageStore")
@observer
class LockableApp extends Component {
  componentDidMount() {
    const {
      presenceStore: {
        throttledUserInteract,
        getLockoutSettings,
        onWindowFocus,
        onWindowBlur
      }
    } = this.props;

    document.addEventListener("mousemove", throttledUserInteract);
    document.addEventListener("touchmove", throttledUserInteract);
    document.addEventListener("click", throttledUserInteract);
    document.addEventListener("keypress", throttledUserInteract);

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);

    getLockoutSettings();
  }

  componentWillUnmount() {
    const {
      presenceStore: { throttledUserInteract, onWindowBlur, onWindowFocus }
    } = this.props;

    document.removeEventListener("touchmove", throttledUserInteract);
    document.removeEventListener("mousemove", throttledUserInteract);
    document.removeEventListener("click", throttledUserInteract);
    document.removeEventListener("keypress", throttledUserInteract);

    window.removeEventListener("focus", onWindowFocus);
    window.removeEventListener("blur", onWindowBlur);
  }

  render() {
    const { presenceStore, sidemenuStore, messageStore } = this.props;

    return presenceStore.locked ? (
      <LockedApp />
    ) : (
      <div>
        {(sidemenuStore.loadedApp && messageStore.loadedInitialMessages) || (
            <Loading />
          )}

        {sidemenuStore.loadedApp && (
          <Switch>
            <Route path="/admin" component={AdminApp} />
            <Route path="/" component={ChatApp} />
          </Switch>
        )}
      </div>
    );
  }
}

export default withRouter(LockableApp);
