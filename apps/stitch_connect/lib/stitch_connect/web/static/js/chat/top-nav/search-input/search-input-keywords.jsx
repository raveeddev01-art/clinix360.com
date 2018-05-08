import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import flatten from "lodash/flatten";

const KEYWORD_GROUPS = [
  {
    header: "Conversation",
    items: [
      { value: "from:", description: "team member" },
      { value: "to:", description: "team member" },
      {
        value: "in:",
        description: "a room or multi user direct message"
      }
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

// @TODO create keyboard controllable dropdown as separate component
class SearchInputKeyword extends Component {
  constructor(...args) {
    super(...args);

    this.items = flatten(KEYWORD_GROUPS.map(group => group.items));
    this.state = {
      activeIndex: 0,
      isActive: false
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      this.setState({ activeIndex: 0 });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onSelectItem = value => event => {
    const { onSelect } = this.props;
    onSelect(value);

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  onActive = index => () => {
    this.setState({ activeIndex: index, isActive: true });
  };

  onInactive = () => {
    this.setState({ isActive: false });
  };

  onKeyDown = evt => {
    const { activeIndex, isActive } = this.state;
    const items = this.getItems();

    switch (evt.keyCode) {
      case 38: // arrow up
        this.setState({
          activeIndex:
            activeIndex - 1 >= 0 ? activeIndex - 1 : items.length - 1,
          isActive: true
        });
        evt.preventDefault();
        evt.stopPropagation();
        break;
      case 40: // arrow down
        this.setState({
          activeIndex: activeIndex + 1 >= items.length ? 0 : activeIndex + 1,
          isActive: true
        });
        evt.preventDefault();
        evt.stopPropagation();
        break;
      case 13: // return
        if (isActive && items.length) {
          const selectedItem = items[activeIndex];
          this.onSelectItem(selectedItem.value)();
          evt.preventDefault();
          evt.stopPropagation();
        }
        break;
      default:
    }
  };

  getItems = () =>
    this.items.filter(item => item.value.indexOf(this.props.filter) === 0);

  getIndex = (items, item) => items.findIndex(i => i.value === item.value);

  render() {
    const { activeIndex, isActive } = this.state;
    const { filter } = this.props;
    const items = this.getItems();

    if (!items.length) {
      return null;
    }

    return (
      <div className="search-input-menu open">
        <ul className="dropdown-menu" onMouseLeave={this.onInactive}>
          <div className="menu-header">Select a modifier</div>
          <div className="menu-content has-header">
            {KEYWORD_GROUPS.map((keywordGroup, i) => {
              const renderedItems = keywordGroup.items
                .filter(item => item.value.indexOf(filter) === 0)
                .map(item => {
                  const itemIndex = this.getIndex(items, item);
                  return (
                    <li
                      className={cx("search-input-dropdown-item", {
                        active: activeIndex === itemIndex && isActive
                      })}
                      key={`item_${item.value}`}
                      onMouseEnter={this.onActive(itemIndex)}
                      onMouseDown={this.onSelectItem(item.value)}
                    >
                      <span className="item-text">
                        <span className="username">{item.value}</span>
                        <span className="text-muted">{item.description}</span>
                      </span>
                    </li>
                  );
                });

              if (renderedItems.length) {
                return [
                  <li className="dropdown-header" key={`header_${i}`}>
                    {keywordGroup.header}
                  </li>,
                  ...renderedItems,
                  i < KEYWORD_GROUPS.length - 1 &&
                    !filter && <li className="divider" key={`divider_${i}`} />
                ];
              }

              return null;
            })}
          </div>
        </ul>
      </div>
    );
  }
}

SearchInputKeyword.propTypes = {
  onSelect: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired
};

SearchInputKeyword.defaultProps = {
  onSelect: () => undefined,
  filter: ""
};

export default SearchInputKeyword;
