import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

@inject("globalStarredMessageStore")
@observer
class GlobalStarredMessages extends Component {
  renderStarredResults() {
    const { globalStarredMessageStore } = this.props;

    if (globalStarredMessageStore.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (globalStarredMessageStore.starredMessages.length > 0) {
      return (
        <div>
          {globalStarredMessageStore.starredMessages.map(message => (
            <AddonMessage key={message.id} message={message} />
          ))}
        </div>
      );
    }

    return <div className="text-muted text-center">Nothing starred yet.</div>;
  }

  render() {
    return (
      <div className="global-starred-messages-addon">
        {this.renderStarredResults()}
      </div>
    );
  }
}

export default GlobalStarredMessages;
