import React, { Component } from "react";
import { observer } from "mobx-react";

import SearchResultItem from "../message-search/search-result-item";

@observer
class GlobalStarredMessage extends Component {
  render() {
    const { message } = this.props;

    return <SearchResultItem message={message} />;
  }
}

export default GlobalStarredMessage;
