import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Form from "react-bootstrap/lib/Form";
import SearchInputDropdown from "./search-input-dropdown";
import SearchInputDatepicker from "./search-input-datepicker";
import SearchInputKeywords from "./search-input-keywords";

@inject("addonStore", "searchStore", "usersStore", "groupsStore")
@observer
class SearchInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
      isDropdownVisible: false,
      isDatepickerVisible: false,
      isKeywordDropdownVisible: false,
      items: [],
      keyword: "",
      currentWord: "",
      hasFocus: false,
      dateChunk: ""
    };
  }

  onSearch = event => {
    if (event) {
      event.preventDefault();
    }

    const { addonStore, searchStore } = this.props;
    const { query, isDropdownVisible } = this.state;

    this.setState({
      isDropdownVisible: false,
      isDatepickerVisible: false,
      isKeywordDropdownVisible: false
    });

    // Treat an empty query as a non-event
    // Do not open panel or search
    if (!query.trim() || isDropdownVisible) {
      return;
    }

    searchStore.setQuery(query);
    addonStore.setAddonPanel("Search Results");
    addonStore.toggleAddons(true);
  };

  onSearchQueryChange = event => {
    this.setState({ query: event.target.value }, () => {
      this.checkCursor();
    });
  };

  onKeyUp = event => {
    switch (event.keyCode) {
      case 27: // esc
        this.clearSearch(event);
        break;
      default:
    }
  };

  onSelect = value => {
    this.replaceCurrentWord(`${this.state.keyword}${value} `, () => {
      this.onSearch();
    });
  };

  onSelectKeyword = value => {
    this.replaceCurrentWord(`${value}`, () => {
      this.checkCursor();
    });
  };

  getCurrentWord = () => {
    const text = this.state.query;
    const cursorPos = this.searchInput.selectionStart;
    const preWord = text
      .substring(0, cursorPos)
      .match(/[:+\-@#A-Za-z0-9_,/]*$/)[0];
    const postWord = text.substring(cursorPos).match(/^[:+\-A-Za-z0-9_,/]*/)[0];
    return `${preWord}${postWord}`;
  };

  replaceCurrentWord = (word, cb) => {
    const cursorPos = this.searchInput.selectionStart;
    const text = this.state.query;
    const preWord = text
      .substring(0, cursorPos)
      .match(/[:+\-@#A-Za-z0-9_,/]*$/)[0];
    const postWord = text.substring(cursorPos).match(/^[:+\-A-Za-z0-9_,/]*/)[0];
    const query =
      text.substring(0, cursorPos - preWord.length) +
      word +
      text.substring(cursorPos + postWord.length);

    this.setState(
      {
        isDropdownVisible: false,
        isDatepickerVisible: false,
        currentWord: "",
        query
      },
      () => {
        // after replacing, the cursor pos should be persistent
        const newPos = cursorPos - preWord.length + word.length;
        this.searchInput.focus();
        this.searchInput.setSelectionRange(newPos, newPos);

        if (typeof cb === "function") {
          cb();
        }
      }
    );
  };

  handleFocus = () => {
    this.setState({ hasFocus: true });
  };

  handleBlur = () => {
    this.setState({ hasFocus: false });
  };

  checkCursor = () => {
    const word = this.getCurrentWord();

    const result = this.props.searchStore.checkWord(word);

    const newState = {
      items: [],
      dateChunk: "",
      currentWord: word,
      isDropdownVisible: false,
      isDatepickerVisible: false,
      isKeywordDropdownVisible: true,
      ...result
    };

    if (
      newState.items &&
      !newState.items.length &&
      newState.isDropdownVisible
    ) {
      newState.isDropdownVisible = false;
    }

    this.setState(newState);
  };

  clearSearch = event => {
    const { searchStore } = this.props;

    event.preventDefault();
    this.setState({ query: "" }, () => {
      this.checkCursor();
    });
    searchStore.reset();
  };

  render() {
    const {
      query,
      items,
      isDropdownVisible,
      isDatepickerVisible,
      isKeywordDropdownVisible,
      hasFocus,
      currentWord,
      dateChunk
    } = this.state;

    const menuItems =
      items &&
      items.sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1)).slice(0, 10);

    return (
      <Form onSubmit={this.onSearch} className="search-input-form">
        <i className="fa fa-search search-input-icon" />
        <input
          className="form-control"
          type="text"
          placeholder="Search"
          ref={input => {
            this.searchInput = input;
          }}
          onChange={this.onSearchQueryChange}
          onMouseUp={this.checkCursor}
          onKeyUp={this.onKeyUp}
          value={query}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
        {query && (
          <a role="link" onClick={this.clearSearch}>
            <i className="fa fa-times-circle-o search-input-icon" />
          </a>
        )}
        {isDropdownVisible && (
          <SearchInputDropdown items={menuItems} onSelect={this.onSelect} />
        )}
        {isDatepickerVisible && (
          <SearchInputDatepicker
            dateChunk={dateChunk}
            onSelect={this.onSelect}
          />
        )}
        {!isDropdownVisible &&
          !isDatepickerVisible &&
          hasFocus &&
          isKeywordDropdownVisible && (
            <SearchInputKeywords
              onSelect={this.onSelectKeyword}
              query={query}
              filter={currentWord}
            />
          )}
      </Form>
    );
  }
}

export default SearchInput;
