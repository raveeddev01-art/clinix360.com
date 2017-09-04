import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";

import MessagePool from "./message-pool";
import DateSeparator from "./date-separator";

@inject("messageStore")
@observer
class MessageList extends Component {
  componentDidMount() {
    const { messageStore } = this.props;

    messageStore.loadChatDiv(this.chatDiv);
  }

  componentWillUnmount() {
    const { messageStore } = this.props;

    messageStore.unloadChatDiv();
  }

  onScrollTop = () => {
    this.props.messageStore.loadPastMessages();
  };

  onLoseTopScroll = () => {};

  onScrollBottom = () => {
    this.props.messageStore.isScrollBottom = true;
  };

  onLoseBottomScroll = () => {
    this.props.messageStore.isScrollBottom = false;
  };

  render() {
    const { messageStore } = this.props;
    const { messagesByDate } = messageStore;

    return (
      <div
        id="chat"
        ref={div => {
          this.chatDiv = div;
        }}
      >
        {Object.keys(messagesByDate).map(date =>
          <div key={`${date}`}>
            <DateSeparator timestamp={date} />
            {messagesByDate[date].map(messagePool =>
              <MessagePool
                key={`${messagePool[0].id}`}
                messagePool={messagePool}
              />
            )}
          </div>
        )}
        <Element name="topPosition" className="topPosition" />
        <div className="bottomPositionWrapper">
          {/* react-scroll only checks for top position, so, to check bottom pos, it should take 100vh */}
          <Element name="bottomPosition" className="bottomPosition" />
        </div>
        <Link
          to="bottomPosition"
          spy
          smooth={false}
          containerId="chat"
          onSetActive={this.onScrollBottom}
          onSetInactive={this.onLoseBottomScroll}
          isDynamic
        />
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
