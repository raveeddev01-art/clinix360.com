import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
import BrowserNotification from "./browser-notification";
import EmailNotification from "./email-notification";
import DesktopNotification from "./desktop-notification";
import ChannelNotifications from "./channel-notifications";
import withAlertState from "../../../util/with_alert_state";

@inject("titleStore", "adminPanelStore")
@withAlertState
class YouNotifications extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Notifications");
    this.props.adminPanelStore.setHeading("Notifications", "fa-bell");
  }

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-bell" /> Notifications
          </h1>
        </Panel.Heading>

        <Panel.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          {window.Notification && <BrowserNotification />}
          <EmailNotification
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <DesktopNotification
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <ChannelNotifications
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
        </Panel.Body>
      </Panel>
    );
  }
}

export default YouNotifications;
