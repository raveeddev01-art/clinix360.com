import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";

import Message from "./message";
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
          <div key={`msgblock_${date}`}>
            <DateSeparator timestamp={date} />
            {messageStore.messagesByDate[date].map(msgPool =>
              <Message key={`msg_${msgPool[0].id}`} messagePool={msgPool} />
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
