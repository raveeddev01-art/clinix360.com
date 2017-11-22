import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("notificationStore")
@observer
class NotificationPreferences extends Component {
  render() {
    const { notificationStore } = this.props;

    return (
      <div className="collapse-content room-details">
        <h5>Desktop notifications</h5>
        <p className="text-capitalize">{notificationStore.desktopPref}</p>

        <h5>Email notifications</h5>
        <p className="text-capitalize">{notificationStore.emailPref}</p>
      </div>
    );
  }
}

export default NotificationPreferences;
