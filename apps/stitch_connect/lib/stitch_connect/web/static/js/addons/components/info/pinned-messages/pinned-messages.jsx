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
        {messageStore.pinnedMessages.map(message =>
          <AddonMessage key={message.id} message={message} />
        )}
      </div>
    );
  }
}

export default PinnedMessages;
