import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import { AddonMessage } from "common/components";
import LoadingIcon from "common/components/loading-icon";

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

  renderSearchResults() {
    const { searchStore } = this.props;

    if (searchStore.loading) {
      return (
        <div className="text-center">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (searchStore.messages.length > 0) {
      return (
        <div>
          {searchStore.messages.map(message => (
            <AddonMessage key={message.id} message={message} />
          ))}
        </div>
      );
    }

    return <div className="text-muted text-center">No messages found.</div>;
  }

  render() {
    const { searchStore } = this.props;

    return (
      <div className="message-search-addon">
        {this.renderSearchResults()}

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
