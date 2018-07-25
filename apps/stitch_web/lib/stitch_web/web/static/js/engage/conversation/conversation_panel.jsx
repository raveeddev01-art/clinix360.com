import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import MessageForm from "chat/message-form/message-form";
import Topbar from "./components/topbar";
import MessageList from "./components/message-list";

@inject("conversationMessageStore")
@observer
class ConversationPanel extends Component {
  render() {
    const { conversationMessageStore, asPatient } = this.props;
    return (
      <div id="chat-container">
        <Topbar asPatient={asPatient} />
        <MessageList asPatient={asPatient} />
        <div className="flex-footer">
          <MessageForm
            asPatient={asPatient}
            messageStore={conversationMessageStore}
            allowTypingUsers={false}
            allowJumpingIndicator={false}
          />
        </div>
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
