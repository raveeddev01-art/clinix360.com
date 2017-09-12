import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import BrowserNotification from "./browser-notification";
import EmailNotification from "./email-notification";
import DesktopNotification from "./desktop-notification";
import ChannelNotifications from "./channel-notifications";

export default class YouNotifications extends Component {
  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="text-center">Notifications</h1>
        <BrowserNotification />
        <hr />
        <EmailNotification />
        <hr />
        <DesktopNotification />
        <hr />
        <ChannelNotifications />
      </Panel>
    );
  }
}
