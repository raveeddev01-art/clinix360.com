import React, { Component } from "react";
import PropTypes from "prop-types";

const KEYWORD_GROUPS = [
  {
    header: "Conversation",
    items: [
      { value: "from:", description: "team member" },
      { value: "to:", description: "team member" },
      { value: "in:", description: "a room or multi user direct message" }
    ]
  },
  {
    header: "Time",
    items: [
      { value: "before:", description: "a date" },
      { value: "after:", description: "a date" },
      { value: "during:", description: "a date" },
      { value: "on:", description: "a date" }
    ]
  }
];

class SearchInputKeyword extends Component {
  onSelectItem = value => event => {
    const { onSelect } = this.props;
    onSelect(value);
    event.preventDefault();
    event.stopPropagation();
  };

  render() {
    return (
      <div className="search-input-menu open">
        <ul className="dropdown-menu open">
          <div className="menu-header">Select a modifier</div>
          <div className="menu-content has-header">
            {KEYWORD_GROUPS.map((keywordGroup, i) => [
              <li className="dropdown-header" key={`header_${i}`}>
                {keywordGroup.header}
              </li>,
              ...keywordGroup.items.map(item => (
                <li
                  className="search-input-dropdown-item search-input-dropdown-item__hover"
                  key={`item_${item.value}`}
                  onMouseDown={this.onSelectItem(item.value)}
                >
                  <span className="item-text">
                    <i className="fa fa-plus-square-o" />
                    <span className="username">{item.value}</span>
                    <span className="text-muted">{item.description}</span>
                  </span>
                </li>
              )),
              i < KEYWORD_GROUPS.length - 1 && (
                <li className="divider" key={`divider_${i}`} />
              )
            ])}
          </div>
        </ul>
      </div>
    );
  }
}

SearchInputKeyword.propTypes = {
  onSelect: PropTypes.func.isRequired
};

SearchInputKeyword.defaultProps = {
  onSelect: () => undefined
};

export default SearchInputKeyword;
