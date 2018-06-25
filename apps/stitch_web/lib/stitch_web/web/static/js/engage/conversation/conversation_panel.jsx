import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Scrollbar from "common/components/scrollbar";

import Topbar from "./components/topbar";
import Message from "./components/message";
import MessageForm from "./components/message-form";

@inject("inboxStore")
@observer
class ConversationPanel extends Component {
  render() {
    const { inboxStore } = this.props;

    return (
      <div className="chat-container">
        <Topbar />

        <div className="messages-container">
          <Scrollbar
            className="scrollbar"
            viewRef={ref => {
              this.scrollbar = ref;
            }}
          >
            {inboxStore.currentConversation.conversation_messages.map(
              conversation => {
                return (
                  <Message
                    key={`msg_key_${conversation.id}`}
                    conversation={conversation}
                  />
                );
              }
            )}
          </Scrollbar>
        </div>

        <MessageForm />
      </div>
    );
  }
}

export default ConversationPanel;
