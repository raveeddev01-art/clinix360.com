import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { inject } from "mobx-react";
import BrowserNotification from "./browser-notification";
import EmailNotification from "./email-notification";
import DesktopNotification from "./desktop-notification";
import ChannelNotifications from "./channel-notifications";

const header = (
  <h1>
    <i className="fa fa-bell" /> Notifications
  </h1>
);
@inject("titleStore", "adminPanelStore")
export default class YouNotifications extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Notifications");
    this.props.adminPanelStore.setHeading("Notifications");
  }

  render() {
    return (
      <Panel className="admin-panel" header={header}>
        <BrowserNotification />
        <EmailNotification />
        <DesktopNotification />
        <ChannelNotifications />
      </Panel>
    );
  }
}
