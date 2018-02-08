import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { AddonMessage } from "common/components";

@inject("searchStore")
@observer
class MessageSearch extends Component {
  componentWillMount() {
    const { searchStore } = this.props;

    if (searchStore.isEmpty) {
      searchStore.loadMore();
    }
  }

  loadMore = () => {
    const { searchStore } = this.props;

    searchStore.loadMore();
  };

  render() {
    const { searchStore } = this.props;

    return (
      <div className="message-search-addon">
        {searchStore.messages.length > 0 ? (
          <div>
            {searchStore.messages.map(message => (
              <AddonMessage key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <div className="text-muted text-center">No messages found.</div>
        )}

        <div className="footer">
          {searchStore.hasMore && searchStore.messages.length ? (
            <button
              className="btn btn-default btn-sm"
              disabled={searchStore.loading}
              onClick={this.loadMore}
            >
              Load more…
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}

export default MessageSearch;
