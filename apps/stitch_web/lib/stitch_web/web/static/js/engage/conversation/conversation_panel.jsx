import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import UploadProgress from "file-upload/upload-progress";
import MessageForm from "chat/message-form/message-form";
import Topbar from "./components/topbar";
import MessageList from "./components/message-list";

@inject("conversationMessageStore")
@observer
class ConversationPanel extends Component {
  render() {
    const { conversationMessageStore, asPatient } = this.props;
    const className = conversationMessageStore.isLoaded ? "loaded" : "";

    return (
      <div id="chat-container" className={className}>
        <Topbar asPatient={asPatient} />
        <div className="container-bars">
          <UploadProgress />
        </div>
        <MessageList />
        <div className="flex-footer">
          <MessageForm
            asPatient={asPatient}
            messageStore={conversationMessageStore}
            allowMention={false}
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
