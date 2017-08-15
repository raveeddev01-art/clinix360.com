import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MessagePool from "./message-pool";
import DateSeparator from "./date-separator";

@inject("messageStore")
@observer
class MessageList extends Component {
  render() {
    const { messageStore } = this.props;

    return (
      <div id="chat">
        {Object.keys(messageStore.messagesByDate).map(date =>
          <div key={`${date}`}>
            <DateSeparator timestamp={date} />
            {messageStore.messagesByDate[date].map(messagePool =>
              <MessagePool
                key={`${messagePool[0].id}`}
                messagePool={messagePool}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default MessageList;
