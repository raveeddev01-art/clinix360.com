import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import _ from "lodash";
import InfiniteScroll from "react-infinite-scroller";

import AddonMessage from "../../../common/components/messages/addon-message";

@inject("searchStore")
@observer
class MessageSearch extends Component {
  constructor(props) {
    super(props);
    this.search = _.debounce(this.props.searchStore.searchMessages, 300);
  }

  componentWillMount() {
    this.props.searchStore.reset();
  }

  loadMore = () => {
    this.search();
  };

  render() {
    const { messages, hasMore } = this.props.searchStore;
    return (
      <div className="message-search-addon">
        <div>
          <InfiniteScroll
            loadMore={this.loadMore}
            hasMore={hasMore}
            useWindow={false}
          >
            {messages.map(message => (
              <AddonMessage
                key={`search_result_${message.id}`}
                message={message}
              />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    );
  }
}

export default MessageSearch;
