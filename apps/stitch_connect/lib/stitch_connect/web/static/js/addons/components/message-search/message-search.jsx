import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import SearchResultItem from "./search-result-item";

@inject("messageStore")
@observer
class MessageSearch extends Component {
  render() {
    return (
      <div className="message-search-addon">
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>
              <i className="fa fa-search" />
            </InputGroup.Addon>
            <FormControl type="text" placeholder="Search Messages" />
          </InputGroup>
        </FormGroup>
        <SearchResultItem />
        <SearchResultItem />
        <SearchResultItem />
      </div>
    );
  }
}

export default MessageSearch;
