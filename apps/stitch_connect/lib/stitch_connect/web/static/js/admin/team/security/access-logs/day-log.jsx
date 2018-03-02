import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import moment from "moment";

import LogItem from "./log-item";

@inject("usersStore")
@observer
class DayLog extends Component {
  _avatarForUser = user_id => {
    let user = _.filter(this.props.usersStore.users, u => u.id === user_id)[0];
    return user.avatar_thumb;
  };

  _fullNameForUser = user_id => {
    let user = _.filter(this.props.usersStore.users, u => u.id === user_id)[0];
    return user.full_name;
  };

  _application = userAgent => {
    if (userAgent.includes("Electron")) {
      return {
        name: "Desktop",
        icon: "fa fa-windows"
      };
    } else if (userAgent.includes("iOS")) {
      return {
        name: "iOS",
        icon: "fa fa-apple"
      };
    } else if (userAgent.includes("Android")) {
      return {
        name: "Android",
        icon: "fa fa-android"
      };
    }

    return {
      name: "Web",
      icon: "fa fa-laptop"
    };
  };

  render() {
    return (
      <div>
        <h2>{this.props.date}</h2>
        {this.props.accessLogs.map((accessLog, i) => {
          return (
            <LogItem
              avatar={this._avatarForUser(accessLog.user_id)}
              fullName={this._fullNameForUser(accessLog.user_id)}
              time={moment
                .utc(accessLog.last_access_at)
                .local()
                .format("h:mm:ss a")}
              application={this._application(accessLog.user_agent)}
              ipAddress={accessLog.ip_address}
              key={i}
            />
          );
        })}
      </div>
    );
  }
}

DayLog.propTypes = {
  date: PropTypes.string.isRequired,
  accessLogs: PropTypes.instanceOf(Array).isRequired
};

export default DayLog;
