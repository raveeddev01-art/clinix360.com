import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonMessage from "../../../../common/components/messages/addon-message";

@inject("messageStore")
@observer
class PinnedMessages extends Component {
  render() {
    const { messageStore } = this.props;

    return (
      <div className="collapse-content group-pinned-messages">
        {messageStore.pinnedMessages.length > 0 ? (
          <div>
            {messageStore.pinnedMessages.map(message => (
              <AddonMessage key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <div className="text-muted">Pin the first message!</div>
        )}
      </div>
    );
  }
}

export default PinnedMessages;
