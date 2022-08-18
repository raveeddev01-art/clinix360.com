import React, { Component } from "react";
import notify from "../../../util/notify";

export default class ReconnectionAlert extends Component {
  render() {
    const errMsg = "No Connection. You'll be able to send messages as soon as you are back online.";
    navigator.onLine ? notify.clear() : notify.show(errMsg, "warning", 300000);

    return (
      <div className="browser-notification-alert reconnection-alert">
        <span>
          Your computer seems to be offline. We'll keep trying to reconnect.
        </span>
      </div>
    );
  }
}
