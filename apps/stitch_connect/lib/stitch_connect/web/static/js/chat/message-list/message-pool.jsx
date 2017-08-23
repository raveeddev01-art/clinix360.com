import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import MessageHead from "../../common/components/message-head/message-head";

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

    return (
      <div className={className}>
        <div className="message-pool">
          <MessageHead timestamp={timestamp} user={user} />
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
