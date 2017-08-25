import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import GlobalStarredMessage from "./global-starred-message";

@inject("globalStarredMessageStore")
@observer
class GlobalStarredMessages extends Component {
  render() {
    const { globalStarredMessageStore } = this.props;

    return (
      <div className="global-starred-messages-addon">
        {globalStarredMessageStore.starredMessages.map(message =>
          <GlobalStarredMessage key={message.id} message={message} />
        )}
      </div>
    );
  }
}

export default GlobalStarredMessages;
