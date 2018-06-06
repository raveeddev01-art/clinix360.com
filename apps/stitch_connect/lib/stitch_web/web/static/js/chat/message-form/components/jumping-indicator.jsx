import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

@inject("messageStore")
@observer
class JumpingIndicator extends Component {
  render() {
    const { messageStore } = this.props;
    const { messages } = messageStore;
    const lastMesage = messages[messages.length - 1];

    return (
      messageStore.showJumpedMessageIndicator && (
        <div
          role="button"
          className="jumped-message-indicator"
          onClick={() => {
            messageStore.switchFromJumpMode();
          }}
        >
          <span className="timestamp">
            Viewing messages from&nbsp;
            {moment(lastMesage.inserted_at).format("MMM Do, YYYY")}
          </span>
          <span className="scroll-to-bottom">
            Jump to recent messages <i className="fa fa-arrow-down" />
          </span>
        </div>
      )
    );
  }
}

export default JumpingIndicator;
