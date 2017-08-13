import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Message from "./message";
import DateSeparator from "./date-separator";

@inject("messageStore")
@observer
class MessageList extends Component {
  render() {
    const { messageStore } = this.props;

    return (
      <div id="chat">
        {Object.keys(messageStore.messagesByDate).map(date =>
          <div key={`msgblock_${date}`}>
            <DateSeparator timestamp={date} />
            {messageStore.messagesByDate[date].map(msgPool =>
              <Message key={`msg_${msgPool[0].id}`} messagePool={msgPool} />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default MessageList;
