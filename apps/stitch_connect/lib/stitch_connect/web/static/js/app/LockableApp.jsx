import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Switch, withRouter, Route } from "react-router-dom";

import LockedApp from "../locked/LockedApp";
import AdminApp from "../admin/AdminApp";
import EngageApp from "../engage/EngageApp";
import ManageApp from "../manage/ManageApp";
import ChatApp from "../chat/ChatApp";
import SystemError from "../common/components/error/system-error";
import browserDetails from "../lib/browser_details";

@inject("presenceStore", "sidemenuStore")
@observer
class LockableApp extends Component {
  constructor(props) {
    super(props);

    const shouldRedirect = browserDetails.mobile;

    this.state = {
      showError: false,
      shouldRedirect
    };

    if (shouldRedirect) window.location.href = "/apps";
  }

  componentDidMount() {
    const {
      presenceStore: {
        throttledUserInteract,
        getLockoutSettings,
        onWindowFocus,
        onWindowBlur,
        fetchFocus
      }
    } = this.props;

    document.addEventListener("mousemove", throttledUserInteract);
    document.addEventListener("touchmove", throttledUserInteract);
    document.addEventListener("click", throttledUserInteract);
    document.addEventListener("keypress", throttledUserInteract);

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);

    fetchFocus();
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

  componentDidCatch(error) {
    this.setState({ hasError: true });
    if (Raven) {
      Raven.captureException(error);
    }
  }

  render() {
    const { presenceStore, sidemenuStore } = this.props;
    const { shouldRedirect } = this.state;

    if (this.state.hasError) {
      return <SystemError />;
    }

    if (presenceStore.locked) {
      return <LockedApp />;
    }

    if (sidemenuStore.loadedApp) {
      return (
        !shouldRedirect && (
          <Switch>
            <Route path="/admin" component={AdminApp} />
            <Route exact path="/engage" component={EngageApp} />
            <Route exact path="/manage" component={ManageApp} />
            <Route path="/" component={ChatApp} />
          </Switch>
        )
      );
    }

    return null;
  }
}

export default withRouter(LockableApp);
