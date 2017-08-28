import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import SearchResultItem from "../message-search/search-result-item";

@inject("messageStore", "searchStore")
@observer
class Mentions extends Component {
  render() {
    return (
      <div className="message-search-addon">
        <SearchResultItem />
        <SearchResultItem />
        <SearchResultItem />
      </div>
    );
  }
}

export default Mentions;
