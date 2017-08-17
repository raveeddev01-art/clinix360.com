import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PinnedMessage from "./pinned-message";

@inject("messageStore")
@observer
class PinnedMessages extends Component {
  render() {
    const { messageStore } = this.props;

    return (
      <div className="pinned-messages">
        {messageStore.pinnedMessages.map(message =>
          <PinnedMessage key={message.id} message={message} />
        )}
      </div>
    );
  }
}

export default PinnedMessages;
