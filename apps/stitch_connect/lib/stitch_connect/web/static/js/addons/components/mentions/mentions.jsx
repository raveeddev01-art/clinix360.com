import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import InfiniteScroll from "react-infinite-scroller";

import AddonMessage from "../../../common/components/messages/addon-message";

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
          {messages.length > 0 ? (
            <div>
              {messages.map(message => (
                <AddonMessage
                  key={`search_result_${message.id}`}
                  message={message}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted text-center">
              No mentions of you found.
            </div>
          )}
        </InfiniteScroll>
      </div>
    );
  }
}

export default Mentions;
