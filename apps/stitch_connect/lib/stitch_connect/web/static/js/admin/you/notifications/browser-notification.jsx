import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";
import Well from "react-bootstrap/lib/Well";
import Button from "react-bootstrap/lib/Button";

@inject("notificationStore")
@observer
class BrowserNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      browserPermission: Notification.permission
    };
  }

  enableNotification = () => {
    const { browserPermission } = this.state;
    if (browserPermission !== "denied") {
      Notification.requestPermission(permission => {
        if (permission === "granted") {
          notify.show("Browser notification is enabled.");
        }
      });
    }
  };

  expandGroupPreferences = () => {
    this.props.notificationStore.toggleGroupPreferences(true);
  };

  render() {
    const permissionGranted = Notification.permission === "granted";
    return (
      <div>
        <h3 className="m-b-20">Browser Notifications</h3>

        <Well>
          <i
            className={cx("fa", "fa-bell", {
              "text-muted": !permissionGranted
            })}
          />
          <p className="m-b-0">
            Desktop notifications are currently
            <strong className={cx({ "text-muted": !permissionGranted })}>
              {permissionGranted ? " enabled" : " not enabled"}
            </strong>. You will {permissionGranted ? "" : " not"} receive
            notifications in this browser.
          </p>
        </Well>

        <p>
          You can&nbsp;
          <a href="#groupPreference" onClick={this.expandGroupPreferences}>
            adjust settings
          </a>&nbsp; for each conversation. To disable notifications, open your
          browser settings.
        </p>

        {!permissionGranted &&
          <div className="clearfix">
            <Button
              bsStyle="primary"
              className="pull-right"
              onClick={this.enableNotification}
            >
              Enable Desktop Notifications
            </Button>
          </div>}
      </div>
    );
  }
}

export default BrowserNotification;
