import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonMessage from "../../../../common/components/messages/addon-message";

@inject("messageStore")
@observer
class StarredMessages extends Component {
  render() {
    const { messageStore } = this.props;

    return (
      <div className="group-starred-messages">
        {messageStore.starredMessages.map(message =>
          <AddonMessage key={message.id} message={message} />
        )}
      </div>
    );
  }
}

export default StarredMessages;
