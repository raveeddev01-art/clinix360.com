import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import BrowserNotificationAlert from "./browser-notification-alert";
import ReconnectionAlert from "./reconnection-alert";
import SlowInternetAlert from "./slow-internet-alert";

@inject("socketStore")
@observer
export default class AppAlert extends Component {
  render() {
    const { socketStore } = this.props;

    if (!socketStore.isConnected) {
      socketStore.onSocketOpen();
      return <ReconnectionAlert />;
    }

    return (
      <div>
        {window.Notification && <BrowserNotificationAlert />}
        <SlowInternetAlert />
      </div>
    )
  }
}
