import React, { Component } from "react";
import { inject } from "mobx-react";

@inject("sidemenuStore")
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
        if (permission === "granted") {
          this.props.sidemenuStore.showNotificationCard(
            "Success",
            "Great! Notifications are now enabled.",
            "notification-enabled"
          );
        }
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
            enable desktop notifications
          </a>&nbsp;for Stitch.
        </span>
        <i
          role="link"
          className="fa fa-times-circle-o close-browser-notification-alert"
          onClick={this.onTooltipClose}
        />
      </div>
    );
  }
}
