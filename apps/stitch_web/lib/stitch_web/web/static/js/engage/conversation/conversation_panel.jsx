import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import MessageForm from "chat/message-form/message-form";
import Topbar from "./components/topbar";
import MessageList from "./components/message-list";

@inject("conversationMessageStore")
@observer
class ConversationPanel extends Component {
  renderMessageList() {
    // Temporarily return just this for the patients
    if (this.props.asPatient) {
      return (
        <div className="messages-container">
          <div>Messages Go here</div>
        </div>
      );
    }

    return <MessageList />;
  }

  render() {
    const { conversationMessageStore, asPatient } = this.props;
    return (
      <div className="chat-container">
        <Topbar asPatient={asPatient} />
        <MessageList />
        {!asPatient && <MessageForm messageStore={conversationMessageStore} />}
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
