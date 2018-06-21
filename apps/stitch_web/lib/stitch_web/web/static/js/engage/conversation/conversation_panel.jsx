import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Topbar from "./components/topbar";

@inject("inboxStore")
@observer
class ConversationPanel extends Component {
  render() {
    const { inboxStore } = this.props;

    return (
      <div className="chat-container">
        <Topbar />

        {inboxStore.currentConversation.conversation_messages.map(
          conversation => {
            return (
              <div key={`conversation_msg_${conversation.id}`}>
                <h3>{conversation.text_content}</h3>
                <h4>{conversation.inserted_at}</h4>

                <hr />
              </div>
            );
          }
        )}
      </div>
    );
  }
}

export default ConversationPanel;
