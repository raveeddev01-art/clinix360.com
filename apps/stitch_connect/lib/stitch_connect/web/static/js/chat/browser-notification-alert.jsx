import React, { Component } from "react";

export default class BrowserNotificationAlert extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      browserPermission: Notification.permission,
      close: false
    };
  }

  onTooltipClose = () => {
    this.setState({ close: true });
  };

  enableNotification = () => {
    const { browserPermission } = this.state;
    if (browserPermission !== "denied") {
      Notification.requestPermission(permission => {
        this.setState({ browserPermission: permission });
      });
    }
  };

  render() {
    if (this.state.browserPermission !== "default" || this.state.close) {
      return null;
    }

    return (
      <div className="browser-notification-alert">
        <span>
          We recommend you&nbsp;
          <a role="link" onClick={this.enableNotification}>
            enable
          </a>&nbsp; desktop notifications for Stitch Connect.
        </span>
        <i
          role="link"
          className="fa fa-close close-browser-notification-alert"
          onClick={this.onTooltipClose}
        />
      </div>
    );
  }
}
