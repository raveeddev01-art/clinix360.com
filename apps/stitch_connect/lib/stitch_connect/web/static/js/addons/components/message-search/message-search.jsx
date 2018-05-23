import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

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

  setOrder = value => () => {
    const { searchStore } = this.props;

    if (value !== searchStore.orderBy) {
      searchStore.setOrder(value);
    }
  };

  loadMore = () => {
    const { searchStore } = this.props;

    searchStore.loadMore();
  };

  renderSearchResults() {
    const { searchStore } = this.props;

    if (searchStore.loading) {
      return (
        <div className="loading-wrapper">
          <LoadingIcon size={2} />
        </div>
      );
    }

    if (searchStore.messages.length > 0) {
      return (
        <div>
          {searchStore.messages.map(message => (
            <AddonMessage inSearch key={message.id} message={message} />
          ))}
        </div>
      );
    }

    return <div className="text-muted text-center">No messages found.</div>;
  }

  renderOrderByToggle() {
    const { searchStore } = this.props;

    const recencyClass = cx("btn btn-default btn-sm", {
      active: searchStore.orderBy === "recency"
    });

    const relevanceClass = cx("btn btn-default btn-sm", {
      active: searchStore.orderBy === "relevance"
    });

    return (
      <div className="search-results-addon-order-by">
        <div className="btn-group">
          <span className={recencyClass} onClick={this.setOrder("recency")}>
            Recent
          </span>
          <span className={relevanceClass} onClick={this.setOrder("relevance")}>
            Relevant
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { searchStore } = this.props;

    return (
      <div className="search-results-addon">
        {!searchStore.loading && this.renderOrderByToggle()}
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
