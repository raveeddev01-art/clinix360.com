import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import BrowserNotification from "./browser-notification";
import EmailNotification from "./email-notification";
import DesktopNotification from "./desktop-notification";
import ChannelNotifications from "./channel-notifications";

const header = (
  <h1><i className="fa fa-bell"></i> Notifications</h1>
);

export default class YouNotifications extends Component {
  render() {
    return (
      <Panel className="admin-panel" header={header}>
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
