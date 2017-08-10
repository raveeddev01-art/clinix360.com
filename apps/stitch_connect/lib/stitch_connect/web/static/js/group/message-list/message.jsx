import React, { Component, PropTypes } from "react";
import cx from "classnames";
import moment from "moment";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

class Message extends Component {
  _renderTooltip = timestamp => {
    return (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );
  };

  render() {
    const { user, text, timestamp } = this.props;
    const className = cx("message", {
      "message-own": user.id === currentUser.id
    });

    return (
      <div className={className}>
        <div className="content">
          <h4>
            {`${user.first_name} ${user.last_name} `}
            <OverlayTrigger
              placement="top"
              overlay={this._renderTooltip(timestamp)}
            >
              <small>
                {moment(timestamp).format("HH:mm A")}
              </small>
            </OverlayTrigger>
          </h4>
          <div className="content-body">
            {text}
          </div>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  user: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
  timestamp: PropTypes.any
};

export default Message;
