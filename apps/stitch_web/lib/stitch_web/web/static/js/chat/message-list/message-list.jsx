import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, Element } from "react-scroll";
import DateSeparator from "common/components/date-separator/date-separator";
import WelcomeMessage from "./welcome-message";
import Message from "./message";
import SystemMessage from "./system-message";
import MessageInfoModal from "./message-info-modal";
import FileShareModal from "./file-share-modal";
import MessageShareModal from "./message-share-modal";

@inject("messageStore")
@observer
class MessageList extends Component {
  componentDidMount() {
    const { messageStore, isThreadView } = this.props;

    messageStore.loadChatDiv(this.chatDiv);

    if (isThreadView) {
      setTimeout(() => {
        messageStore.scrollToNewBanner();
      }, 1000);

    }
  }

  componentWillUnmount() {
    const { messageStore } = this.props;
    messageStore.unloadChatDiv();
  }

  onScrollTop = () => {
    this.props.messageStore.onScrollTopReached();
  };

  onLoseTopScroll = () => { };

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
    const { messageStore, isThreadView } = this.props;
    const { messagesByDate, messagesByDateDesc, newMessageLineMessage, highlightId, messages } = messageStore;
    const orderBy = isThreadView ? messagesByDateDesc : messagesByDate;

    return (
      <div
        id="chat"
        ref={div => {
          this.chatDiv = div;
        }}
      >
        {!messageStore.jumpMode && messageStore.loadedAll && !isThreadView && <WelcomeMessage />}
        {!messageStore.jumpMode &&
          messageStore.isLoadingPast && (
            <div className="loading-message">Loading messages...</div>
          )}

        {(!messageStore.jumpMode || messageStore.isJumpLoaded) &&
          !isThreadView ?
          Object.keys(orderBy).map(date => (
            <div key={`${date}`}>
              <DateSeparator timestamp={date} />
              {orderBy[date].map(
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
                      isThreadView={isThreadView}
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
                      lastOtherUserMessage={messageStore.lastOtherUserMessage}
                      messageStore={messageStore}
                      chatDiv={messageStore.chatDiv}
                      onMounted={messageStore.onMessageMounted}
                      onUnmounted={messageStore.onMessageUnmounted}
                      onShow={messageStore.onMessageShow}
                      onHide={messageStore.onMessageHide}
                      isHighlighted={highlightId === message.id}
                    />
                  )
              )}
            </div>
          )) :
          (<div key={`thread`}>
            {messages.map(
              (message, index) =>
              ( <div className="message-container addon thread" key={index}>
                  <div className="message message-thread">
                    <Message
                      // start of dummy prop so that message list react to message prop change
                      edited_at={message.edited_at}
                      isThreadView={isThreadView}
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
                      lastOtherUserMessage={messageStore.lastOtherUserMessage}
                      messageStore={messageStore}
                      chatDiv={messageStore.chatDiv}
                      onMounted={messageStore.onMessageMounted}
                      onUnmounted={messageStore.onMessageUnmounted}
                      onShow={messageStore.onMessageShow}
                      onHide={messageStore.onMessageHide}
                      isHighlighted={highlightId === message.id}
                    />
                  </div>
                </div>
              )
            )}
          </div>)
        }
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
        <FileShareModal />
        <MessageShareModal />
      </div>

    );
  }
}

MessageList.defaultProps = {
  isThreadView: false
};

export default MessageList;
