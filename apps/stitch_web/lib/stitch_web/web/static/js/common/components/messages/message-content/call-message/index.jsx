import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import moment from "moment";
import cx from "classnames";

import Avatar from "../../../avatar/avatar";
import BrowserWindow from "../../../../../util/windows";

@inject("usersStore")
@observer
class CallMessage extends Component {
  onInitCall = () => {
    const { message: { fields: { hash } } } = this.props;
    BrowserWindow.open(`/call/${hash}`, { name: "calling" });
  };

  renderActiveCallDetails() {
    const { message, usersStore } = this.props;
    const { active_now } = message.fields;
    const activeCount = active_now.length;
    const startedAt = moment
      .utc(message.inserted_at)
      .local()
      .format("h:mm A");

    const activeAvatars = active_now.map((x, i) => {
      const user = usersStore.usersById[x];
      return <Avatar key={i} user={user} />;
    });

    return (
      <span>
        Started at {startedAt} &nbsp; &nbsp; &nbsp;
        <i className="fa fa-user" /> &nbsp;
        {activeCount} &nbsp; &nbsp; &nbsp;
        {activeAvatars}
      </span>
    );
  }

  renderEndedCallDetails() {
    const { message, usersStore } = this.props;
    const { started_at, ended_at, attendees } = message.fields;
    const seconds = Math.round(((ended_at || 0) - (started_at || 0)) / 1000);

    const attendeeNames = attendees
      .map(x => usersStore.usersById[x].full_name)
      .join(", ");

    const [h, m, sec] = moment("2015-01-01")
      .startOf("day")
      .seconds(seconds)
      .format("H:mm:ss")
      .split(":")
      .map(Number);

    const mm = m + h * 60;
    const min = mm ? `${mm} min ` : "";
    const duration = `${min}${sec} sec`;

    return (
      <span>
        Lasted <b>{duration}</b> with <b>{attendeeNames}</b>
      </span>
    );
  }

  render() {
    const { message } = this.props;
    const { call_status, active_now } = message.fields;
    const iHaveJoined = active_now.some(x => x === currentUser.id);
    const isActiveCall = ["ringing", "talking"].includes(call_status);
    const cardClasses = cx("call-message__card", { active: isActiveCall });
    const faClasses = cx("fa fa-phone", { "fa-rotate-135": !isActiveCall });
    const iconClasses = cx("call-message__card-icon", { active: isActiveCall });
    return (
      <div className="call-message">
        <div className="call-message__title">
          Started a call &nbsp;
          <i className="fa fa-caret-down" />
        </div>
        <div className={cardClasses}>
          <div className={iconClasses}>
            <i className={faClasses} />
          </div>
          <div className="call-message__card-body">
            <div className="call-message__card-status">
              {isActiveCall ? (
                <a role="link" onClick={this.onInitCall}>
                  {iHaveJoined
                    ? "You are on this call"
                    : "Click to join this call"}
                </a>
              ) : (
                "This call has ended"
              )}
            </div>
            <div className="call-message__card-details">
              {isActiveCall
                ? this.renderActiveCallDetails()
                : this.renderEndedCallDetails()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CallMessage.defaultProps = {
  message: { fields: {} }
};

CallMessage.propTypes = {
  message: PropTypes.any.isRequired
};

export default CallMessage;
