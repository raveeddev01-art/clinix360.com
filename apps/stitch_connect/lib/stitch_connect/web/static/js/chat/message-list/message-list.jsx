import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";

import Message from "./message";
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
    this.props.messageStore.onScrollTopReached();
  };

  onLoseTopScroll = () => {};

  onScrollBottom = () => {
    this.props.messageStore.onScrollBottomReached();
  };

  onLoseBottomScroll = () => {
    this.props.messageStore.onScrollBottomLeft();
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
        {messageStore.isLoadingPast &&
          <div className="loading-message">Loading messages...</div>}
        {Object.keys(messagesByDate).map(date =>
          <div key={`${date}`}>
            <DateSeparator timestamp={date} />
            {messagesByDate[date].map(message => {
              const { user, inserted_at: timestamp } = message;
              if (
                messageStore.newMessageLineMessage &&
                messageStore.newMessageLineMessage.id === message.id
              ) {
                return [
                  <Element name="newMessageBanner" />,
                  <div className="new-message-banner">
                    <div className="banner-text">New Messages</div>
                  </div>,
                  <Message
                    key={`msg_${message.id}`}
                    message={message}
                    timestamp={timestamp}
                    user={user}
                  />
                ];
              }
              return (
                <Message
                  key={`msg_${message.id}`}
                  message={message}
                  timestamp={timestamp}
                  user={user}
                />
              );
            })}
          </div>
        )}
        {messageStore.isLoadingRecent &&
          <div className="loading-message">Loading recent messages...</div>}
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
