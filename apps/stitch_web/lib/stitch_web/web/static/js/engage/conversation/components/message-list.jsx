import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import DateSeparator from "common/components/date-separator/date-separator";

import Message from "./message";

@inject("conversationMessageStore")
@observer
class MessageList extends Component {
  render() {
    const { conversationMessageStore } = this.props;
    const { messagesByDate } = conversationMessageStore;

    return (
      <div className="messages-container">
        {Object.keys(messagesByDate).map(date => (
          <div key={`${date}`}>
            <DateSeparator timestamp={date} />
            {messagesByDate[date].map(message => (
              <Message
                // start of dummy prop so that message list react to message prop change
                edited_at={message.edited_at}
                status={message.status}
                is_sequential={message.is_sequential}
                reactions_web={message.reactions_web}
                link_previews={message.link_previews}
                // end of dummy prop
                key={`message_${message.id}`}
                message={message}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default MessageList;
