import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link, Element } from "react-scroll";
import DateSeparator from "common/components/date-separator/date-separator";

import Message from "chat/message-list/message";

@inject("conversationMessageStore")
@observer
class MessageList extends Component {
  componentDidMount() {
    const { conversationMessageStore } = this.props;

    conversationMessageStore.loadChatDiv(this.chatDiv);
  }

  componentWillUnmount() {
    const { conversationMessageStore } = this.props;

    conversationMessageStore.unloadChatDiv();
  }

  onScrollTop = () => {
    this.props.conversationMessageStore.onScrollTopReached();
  };

  onLoseTopScroll = () => {};

  onScrollBottom = () => {
    this.props.conversationMessageStore.onScrollBottomReached();
  };

  onLoseBottomScroll = () => {
    this.props.conversationMessageStore.onScrollBottomLeft();
  };

  render() {
    const { conversationMessageStore } = this.props;
    const { messagesByDate } = conversationMessageStore;

    return (
      <div
        id="chat"
        ref={div => {
          this.chatDiv = div;
        }}
      >
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
                isConversationMessage
                message={message}
                messageStore={conversationMessageStore}
                chatDiv={conversationMessageStore.chatDiv}
                onMounted={conversationMessageStore.onMessageMounted}
                onUnmounted={conversationMessageStore.onMessageUnmounted}
              />
            ))}
          </div>
        ))}
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
