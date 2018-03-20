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
    const { messagesByDate, newMessageLineMessage, highlightId } = messageStore;

    return (
      <div
        id="chat"
        ref={div => {
          this.chatDiv = div;
        }}
      >
        {!messageStore.jumpMode && messageStore.loadedAll && <WelcomeMessage />}
        {!messageStore.jumpMode &&
          messageStore.isLoadingPast && (
            <div className="loading-message">Loading messages...</div>
          )}

        {(!messageStore.jumpMode || messageStore.isJumpLoaded) &&
          Object.keys(messagesByDate).map(date => (
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
                    <Message
                      // start of dummy prop so that message list react to message prop change
                      edited_at={message.edited_at}
                      pinned={message.pinned}
                      starred={message.starred}
                      status={message.status}
                      is_sequential={message.is_sequential}
                      reactions_web={message.reactions_web}
                      link_previews={message.link_previews}
                      // end of dummy prop
                      key={`message_${message.id}`}
                      message={message}
                      hasNML={
                        newMessageLineMessage &&
                        newMessageLineMessage.id === message.id
                      }
                      isHighlighted={highlightId === message.id}
                    />
                  )
              )}
            </div>
          ))}
        {!messageStore.jumpMode &&
          messageStore.isLoadingRecent && (
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
