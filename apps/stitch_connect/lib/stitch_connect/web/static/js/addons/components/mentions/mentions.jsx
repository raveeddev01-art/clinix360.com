import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import SearchResultItem from "../message-search/search-result-item";

@inject("searchStore")
@observer
class Mentions extends Component {
  componentWillMount() {
    this.props.searchStore.reset();
    this.props.searchStore.searchMentions();
  }

  render() {
    const { messages, total } = this.props.searchStore;

    return (
      <div className="message-search-addon">
        <p>
          {total} Found
        </p>
        {messages.map(message =>
          <SearchResultItem
            key={`search_result_${message.id}`}
            message={message}
          />
        )}
      </div>
    );
  }
}

export default Mentions;
