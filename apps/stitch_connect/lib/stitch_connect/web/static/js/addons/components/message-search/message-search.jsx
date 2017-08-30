import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import _ from "lodash";
import InfiniteScroll from "react-infinite-scroller";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Form from "react-bootstrap/lib/Form";
import InputGroup from "react-bootstrap/lib/InputGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import SearchResultItem from "./search-result-item";

@inject("messageStore", "searchStore")
@observer
class MessageSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ""
    };
    this.search = _.debounce(this.props.searchStore.searchMessages, 300);
  }

  componentWillMount() {
    this.props.searchStore.reset();
  }

  onChange = evt => {
    this.setState({ query: evt.target.value });
    this.search(evt.target.value);
  };

  onSearch = evt => {
    evt.preventDefault();
    this.search(this.state.query);
  };

  loadMore = () => {
    this.search();
  };

  render() {
    const { messages, hasMore } = this.props.searchStore;
    return (
      <div className="message-search-addon">
        <Form onSubmit={this.onSearch}>
          <FormGroup>
            <InputGroup>
              <InputGroup.Addon>
                <i className="fa fa-search" />
              </InputGroup.Addon>
              <FormControl
                type="text"
                placeholder="Search Messages"
                onChange={this.onChange}
                value={this.state.query}
              />
            </InputGroup>
          </FormGroup>
        </Form>
        <div>
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
      </div>
    );
  }
}

export default MessageSearch;
