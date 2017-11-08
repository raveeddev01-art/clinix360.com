import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("socketStore")
@observer
export default class ReconnectionAlert extends Component {
  render() {
    const { socketStore } = this.props;

    if (socketStore.isConnected) {
      return null;
    }

    return (
      <div className="browser-notification-alert reconnection-alert">
        <span>
          Waiting for server connection, trying again in{" "}
          {socketStore.reconnectIn} seconds...{" "}
          <a role="link" onClick={socketStore.reconnect}>
            Try now
          </a>
        </span>
      </div>
    );
  }
}
