import React, { Component } from "react";

export default class ReconnectionAlert extends Component {
  render() {
    return (
      <div className="browser-notification-alert reconnection-alert">
        <span>
          Your computer seems to be offline. We'll keep trying to reconnect.
        </span>
      </div>
    );
  }
}
