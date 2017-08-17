import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import moment from "moment";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Message from "./message";

@inject("messageStore")
@observer
class MessagePool extends Component {
  render() {
    const { messagePool } = this.props;
    const { user, inserted_at: timestamp } = messagePool[0];
    const className = cx("message-pool-container", {
      mine: user.id === currentUser.id
    });
    const timestampTooltip = (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );

    return (
      <div className={className}>
        <div className="message-pool">
          <div className="message-pool-header">
            {`${user.first_name} ${user.last_name} `}

            <OverlayTrigger placement="top" overlay={timestampTooltip}>
              <span className="time">
                {moment(timestamp).format("HH:mm A")}
              </span>
            </OverlayTrigger>
          </div>
          <div className="message-pool-content">
            {messagePool.map(message =>
              <Message key={message.id} message={message} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

MessagePool.propTypes = {
  messagePool: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default MessagePool;
