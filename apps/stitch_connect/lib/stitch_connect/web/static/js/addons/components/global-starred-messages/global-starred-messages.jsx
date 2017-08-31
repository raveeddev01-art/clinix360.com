import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AddonMessage from "../../../common/components/messages/addon-message";

@inject("globalStarredMessageStore")
@observer
class GlobalStarredMessages extends Component {
  render() {
    const { globalStarredMessageStore } = this.props;

    return (
      <div className="global-starred-messages-addon">
        {globalStarredMessageStore.starredMessages.map(message =>
          <AddonMessage key={message.id} message={message} />
        )}
      </div>
    );
  }
}

export default GlobalStarredMessages;
