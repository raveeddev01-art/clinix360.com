import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
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
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Notifications");
    this.props.adminPanelStore.setHeading("Notifications", "fa-bell");
  }

  onSuccess = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "success"
    });
  };

  onError = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "danger"
    });
  };

  hideAlert = () => {
    this.setState({
      alertVisible: false
    });
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
        {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
        <BrowserNotification />
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
      </Panel>
    );
  }
}
