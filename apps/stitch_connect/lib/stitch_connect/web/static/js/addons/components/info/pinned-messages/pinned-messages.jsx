import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonMessage from "../addon-message/addon-message";

@inject("messageStore")
@observer
class PinnedMessages extends Component {
  render() {
    const { messageStore } = this.props;

    return (
      <div className="addon-messages">
        {messageStore.pinnedMessages.map(message =>
          <AddonMessage key={message.id} message={message} />
        )}
      </div>
    );
  }
}

export default PinnedMessages;
