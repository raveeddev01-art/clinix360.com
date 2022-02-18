import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import moment from "moment";
import cx from "classnames";

import Avatar from "../../../avatar/avatar";
import BrowserWindow from "../../../../../util/windows";

@inject("usersStore")
@observer
class MeetLinkMessage extends Component {
  onInitCall = () => {
    const { message: { fields: { hash } } } = this.props;
  };

  copyLinkToClipboard = () => {
    const { message } = this.props;
    navigator.clipboard.writeText('Copy this text to clipboard');
    window.notify.show("Meeting link copied!", "info")
  }

  renderActiveCallDetails() {
    const { message } = this.props;
    const startedAt = moment
      .utc(message.inserted_at)
      .local()
      .format("h:mm A");

    return (
      <span>
        Started at {startedAt} &nbsp; &nbsp; &nbsp;
      </span>
    );
  }

  render() {
    const { message } = this.props;
    const userFullName = message.user.first_name + " " + message.user.last_name + " ";

    const cardClasses = cx("call-message__card", { active: true });
    const faClasses = cx("fa fa-phone", { "fa-rotate-135": false });
    const iconClasses = cx("call-message__card-icon", { active: true });

    console.log(message.text_content, "here is meeting link");

    return (
      <div className="call-message">
        <div className="call-message__title">
          {userFullName} Started a call &nbsp;
          <i className="fa fa-caret-down" />
        </div>
        <div className={cardClasses}>
          <div className={iconClasses}>
            <i className={faClasses} />
          </div>
          <div className="call-message__card-body">
            <div className="call-message__card-status">
              <a href={message.text_content} target="_blank">
                Click to join this call
              </a>
              <a className="copy-icon" onClick={this.copyLinkToClipboard}>
                <i className="fa fa-copy" /> &nbsp;
              </a>
            </div>
            <div className="call-message__card-details">
              {this.renderActiveCallDetails()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MeetLinkMessage.defaultProps = {
  message: { fields: {} }
};

MeetLinkMessage.propTypes = {
  message: PropTypes.any.isRequired
};

export default MeetLinkMessage;
