import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("socketStore")
@observer
export default class ReconnectionAlert extends Component {
  render() {
    const { socketStore } = this.props;

    return (
      <div className="browser-notification-alert reconnection-alert">
        <span>
          Your computer seems to be offline. We'll keep trying to reconnect, or you can&nbsp;
          <a role="link" onClick={socketStore.reconnect}>
            try now
          </a>.
        </span>
      </div>
    );
  }
}
