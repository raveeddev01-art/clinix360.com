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
        this.setState({ browserPermission: permission });
      });
    }
  };

  render() {
    const permissionGranted = Notification.permission === "granted";
    let status = "not enabled";

    switch (Notification.permission) {
      case "granted":
        status = "enabled";
        break;
      case "denied":
        status = "disabled";
        break;
      default:
    }

    return (
      <div>
        <h3 className="m-b-20">Browser Notifications</h3>

        <Well>
          <i
            className={cx("fa", {
              "fa-bell": permissionGranted,
              "fa-bell-slash": !permissionGranted,
              enabled: status === "enabled",
              disabled: status === "disabled"
            })}
          />
          <p className="m-b-0">
            Desktop notifications are currently&nbsp;
            <strong
              className={cx({
                enabled: status === "enabled",
                disabled: status === "disabled"
              })}
            >
              {status}
            </strong>. You {permissionGranted ? "will" : " won't"} receive
            notifications in this browser.
          </p>
        </Well>

        <p>
          We recommend enabling notifications. You can do this by opening your
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
