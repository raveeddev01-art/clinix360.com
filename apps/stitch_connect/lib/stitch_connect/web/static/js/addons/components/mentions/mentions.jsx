import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import InfiniteScroll from "react-infinite-scroller";

import SearchResultItem from "../message-search/search-result-item";

@inject("searchStore")
@observer
class Mentions extends Component {
  componentWillMount() {
    this.props.searchStore.reset();
    this.props.searchStore.searchMentions();
  }

  loadMore = () => {
    this.props.searchStore.searchMessages();
  };

  render() {
    const { messages, hasMore } = this.props.searchStore;

    return (
      <div className="message-search-addon">
        <InfiniteScroll
          loadMore={this.loadMore}
          hasMore={hasMore}
          useWindow={false}
        >
          {messages.map(message =>
            <SearchResultItem
              key={`search_result_${message.id}`}
              message={message}
            />
          )}
        </InfiniteScroll>
      </div>
    );
  }
}

export default Mentions;
