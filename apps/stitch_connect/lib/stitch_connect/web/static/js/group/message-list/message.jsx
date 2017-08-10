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
    const { messagePool } = this.props;
    const { user, createdAt: timestamp } = messagePool[0];
    const texts = messagePool.map(msg => msg.text);
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
            {texts.map((text, index) =>
              <p key={`text_${index}`}>
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  messagePool: PropTypes.array.isRequired
};

export default Message;
