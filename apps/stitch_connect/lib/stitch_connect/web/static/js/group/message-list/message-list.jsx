import React, { Component, PropTypes } from "react";
import cx from "classnames";
import { inject, observer } from "mobx-react";

import Message from "./message.jsx";
import DateSeparator from "./date-separator.jsx";

@inject("sidemenuStore", "messageStore")
@observer
class MessageList extends Component {
  _renderMessageBlock = messages => {
    return messages.map((msg, index) =>
      <Message
        key={`msg_${index}`}
        text={msg.text}
        user={msg.user}
        timestamp={msg.createdAt}
      />
    );
  };

  render() {
    const { sidemenuStore, messageStore } = this.props;

    return (
      <div id="chat">
        {Object.keys(messageStore.messagesByDate).map(date =>
          <div key={`msgblock_${date}`}>
            <DateSeparator timestamp={date} />
            {this._renderMessageBlock(messageStore.messagesByDate[date])}
          </div>
        )}
      </div>
    );
  }
}

export default MessageList;
