import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import BrowserNotificationAlert from "./browser-notification-alert";
import ReconnectionAlert from "./reconnection-alert";

@inject("socketStore")
@observer
export default class AppAlert extends Component {
  render() {
    const { socketStore } = this.props;

    if (!socketStore.isConnected) {
      return <ReconnectionAlert />;
    }

    return window.Notification && <BrowserNotificationAlert />;
  }
}
