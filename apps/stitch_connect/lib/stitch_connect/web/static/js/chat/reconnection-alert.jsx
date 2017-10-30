import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("socketStore")
@observer
export default class ReconnectionAlert extends Component {
  constructor(props) {
    super(props);
  }

  reconnect = () => {
    this.props.socketStore.reconnect();
  };

  render() {
    if (this.props.socketStore.isConnected === true) {
      return null;
    }

    return (
      <div className="browser-notification-alert reconnection-alert">
        <span>
          Waiting for server connection, trying again in{" "}
          {this.props.socketStore.reconnectIn} seconds...{" "}
          <a role="link" onClick={this.reconnect}>
            Try now
          </a>
        </span>
      </div>
    );
  }
}
