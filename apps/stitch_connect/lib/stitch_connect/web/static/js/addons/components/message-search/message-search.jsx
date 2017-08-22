import React, { Component } from "react";
import { inject, observer } from "mobx-react";

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
  }

  onChange = evt => {
    this.setState({ query: evt.target.value });
  };

  onSearch = evt => {
    evt.preventDefault();
    this.props.searchStore.searchMessages(this.state.query);
  };

  render() {
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
        <SearchResultItem />
        <SearchResultItem />
        <SearchResultItem />
      </div>
    );
  }
}

export default MessageSearch;
