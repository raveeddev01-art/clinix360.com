import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import DateSeparator from "common/components/date-separator/date-separator";

import Topbar from "./components/topbar";
import Message from "./components/message";
import MessageForm from "./components/message-form";

@inject("conversationMessageStore")
@observer
class ConversationPanel extends Component {
  renderMessageForConversation = message => {
    return this.props.asPatient ? (
      <div> {message.text_content} </div>
    ) : (
      <Message
        // start of dummy prop so that message list react to message prop change
        edited_at={message.edited_at}
        status={message.status}
        is_sequential={message.is_sequential}
        reactions_web={message.reactions_web}
        link_previews={message.link_previews}
        // end of dummy prop
        key={`message_${message.id}`}
        message={message}
      />
    );
  };

  render() {
    const { conversationMessageStore } = this.props;
    const { messagesByDate } = conversationMessageStore;

    return (
      <div className="chat-container">
        <Topbar asPatient />

        <div className="messages-container">
          {Object.keys(messagesByDate).map(date => (
            <div key={`${date}`}>
              <DateSeparator timestamp={date} />
              {messagesByDate[date].map(this.renderMessageForConversation)}
            </div>
          ))}
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
