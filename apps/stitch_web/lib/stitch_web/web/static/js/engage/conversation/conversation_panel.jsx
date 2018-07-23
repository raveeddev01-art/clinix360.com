import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import Scrollbar from "common/components/scrollbar";

import Topbar from "./components/topbar";
import Message from "./components/message";
import MessageForm from "./components/message-form";

@inject("inboxStore")
@observer
class ConversationPanel extends Component {
  renderMessageForConversation = message => {
    return this.props.asPatient ? (
      <div> {message.text_content} </div>
    ) : (
      <Message key={`msg_key_${message.id}`} message={message} />
    );
  };

  render() {
    const { inboxStore } = this.props;

    return (
      <div className="chat-container">
        <Topbar asPatient />

        <div className="messages-container">
          <Scrollbar
            className="scrollbar"
            viewRef={ref => {
              this.scrollbar = ref;
            }}
          >
            {inboxStore.currentConversation.conversation_messages &&
              inboxStore.currentConversation.conversation_messages.map(
                this.renderMessageForConversation
              )}
          </Scrollbar>
        </div>

        <MessageForm />
      </div>
    );
  }
}

ConversationPanel.propTypes = {
  asPatient: PropTypes.bool
};

ConversationPanel.defaultProps = {
  asPatient: false
};

export default ConversationPanel;
