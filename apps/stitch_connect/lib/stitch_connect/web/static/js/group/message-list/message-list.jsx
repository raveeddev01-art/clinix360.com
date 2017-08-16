import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";

import MessagePool from "./message-pool";
import DateSeparator from "./date-separator";

@inject("messageStore")
@observer
class MessageList extends Component {
  onScrollTop = () => {
    this.props.messageStore.loadPastMessages();
  };

  onLoseTopScroll = () => {
    this.props.messageStore.canLoad = true;
  };

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
        <Element name="topPosition" className="topPosition" />
        <Link
          to="topPosition"
          spy
          containerId="chat"
          onSetActive={this.onScrollTop}
          onSetInactive={this.onLoseTopScroll}
          isDynamic
        />
      </div>
    );
  }
}

export default MessageList;
