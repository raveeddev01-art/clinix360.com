import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";
import moment from "moment";

import WelcomeMessage from "./welcome-message";
import Message from "./message";
import SystemMessage from "./system-message";
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

  getCompiledDateMessages = () => {
    const { messagesByDate } = this.props.messageStore;

    Object.keys(messagesByDate).forEach(date => {
      const messages = messagesByDate[date];
      if (!messages || !messages.length) return;
      let lastMessage = messages[0];
      for (let i = 1; i < messages.length; i += 1) {
        if (
          messages[i].user.id === lastMessage.user.id &&
          lastMessage.type !== "system" &&
          messages[i - 1].type !== "upload" &&
          moment(messages[i].inserted_at).diff(
            moment(lastMessage.inserted_at),
            "seconds"
          ) <
            15 * 60
        ) {
          messages[i].is_sequential = true;
        } else {
          lastMessage = messages[i];
        }
      }
    });
    return messagesByDate;
  };

  render() {
    const { messageStore } = this.props;
    const messagesByDate = this.getCompiledDateMessages();

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
      </div>
    );
  }
}

export default MessageList;
