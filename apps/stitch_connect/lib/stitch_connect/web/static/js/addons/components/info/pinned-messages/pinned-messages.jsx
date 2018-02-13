import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { AddonMessage } from "common/components";

@inject("pinnedMessageStore", "groupStore")
@observer
class PinnedMessages extends Component {
  loadMore = () => {
    const { pinnedMessageStore } = this.props;
    pinnedMessageStore.loadMore();
  };

  render() {
    const { pinnedMessageStore } = this.props;
    return (
      <div className="collapse-content group-pinned-messages">
        {pinnedMessageStore.messages.length > 0 ? (
          <div>
            {pinnedMessageStore.messages.map(message => (
              <AddonMessage key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <div className="text-muted">Pin the first message!</div>
        )}

        <div className="footer">
          {pinnedMessageStore.hasMore && (
            <button
              className="btn btn-default btn-sm"
              disabled={pinnedMessageStore.loading}
              onClick={this.loadMore}
            >
              Load more…
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default PinnedMessages;
