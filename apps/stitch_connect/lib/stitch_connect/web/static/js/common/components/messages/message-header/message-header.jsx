import React, { Component, PropTypes } from "react";
import moment from "moment";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

class MessageHeader extends Component {
  render() {
    const { timestamp, user } = this.props;
    const timestampTooltip = (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );

    return (
      <div className="message-header">
        <div className="name">
          {`${user.first_name} ${user.last_name} `}
        </div>

        <OverlayTrigger placement="top" overlay={timestampTooltip}>
          <span className="time">
            {moment(timestamp).format("hh:mm A")}
          </span>
        </OverlayTrigger>
      </div>
    );
  }
}

export default MessageHeader;
