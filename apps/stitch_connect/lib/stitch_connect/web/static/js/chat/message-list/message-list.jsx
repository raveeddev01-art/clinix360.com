import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";

import WelcomeMessage from "./welcome-message";
import Message from "./message";
import SystemMessage from "./system-message";
import DateSeparator from "./date-separator";
import MessageInfoModal from "./message-info-modal";

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

  onShowInfoModal = id => {
    const { messageStore } = this.props;
    messageStore.infoModalMessageId = id;
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
        {messageStore.loadedAll && <WelcomeMessage />}
        {messageStore.isLoadingPast && (
          <div className="loading-message">Loading messages...</div>
        )}

        {Object.keys(messagesByDate).map(date => (
          <div key={`${date}`}>
            <DateSeparator timestamp={date} />
            {messagesByDate[date].map(
              message =>
                message.type === "system" ? (
                  <SystemMessage
                    key={`message_${message.id}`}
                    message={message}
                  />
                ) : (
                  <Message key={`message_${message.id}`} message={message} />
                )
            )}
          </div>
        ))}
        {messageStore.isLoadingRecent && (
          <div className="loading-message">Loading recent messages...</div>
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
        <MessageInfoModal />
      </div>
    );
  }
}

export default MessageList;
