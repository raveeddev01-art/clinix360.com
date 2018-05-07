import React, { Component } from "react";
import PropTypes from "prop-types";
import SearchInputDropdownMention from "./search-input-dropdown-mention";
import SearchInputDropdownRoom from "./search-input-dropdown-room";

class SearchInputDropdown extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      activeIndex: 0
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onActive = index => () => {
    this.setState({ activeIndex: index });
  };

  onSelectItem = value => () => {
    const { onSelect } = this.props;
    onSelect(value);
  };

  onKeyDown = evt => {
    const { activeIndex } = this.state;
    const { items } = this.props;

    switch (evt.keyCode) {
      case 38: // arrow up
        this.setState({
          activeIndex: activeIndex - 1 >= 0 ? activeIndex - 1 : items.length - 1
        });
        evt.preventDefault();
        evt.stopPropagation();
        break;
      case 40: // arrow down
        this.setState({
          activeIndex: activeIndex + 1 >= items.length ? 0 : activeIndex + 1
        });
        evt.preventDefault();
        evt.stopPropagation();
        break;
      case 13: // return
      case 9: // tab
        if (items.length) {
          const selectedItem = items[activeIndex];
          this.onSelectItem(selectedItem.value)();
        } else {
          this.onSelectItem("")();
        }
        evt.preventDefault();
        evt.stopPropagation();
        break;
      default:
    }
  };

  render() {
    const { activeIndex } = this.state;
    const { items } = this.props;
    if (!items.length) {
      return null;
    }

    return (
      <div className="search-input-menu open">
        <ul className="dropdown-menu">
          <div className="menu-content">
            {items.map((item, index) => {
              let Item = null;
              if (item.type === "user") {
                Item = SearchInputDropdownMention;
              } else if (item.type === "group") {
                Item = SearchInputDropdownRoom;
              }

              if (item) {
                return (
                  <Item
                    key={`search-item-${item.type}-${item.id}`}
                    itemId={item.id}
                    isActive={activeIndex === index}
                    onHover={this.onActive(index)}
                    onSelectItem={this.onSelectItem(item.value)}
                  />
                );
              }

              return null;
            })}
          </div>
        </ul>
      </div>
    );
  }
}

SearchInputDropdown.propTypes = {
  items: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired
};

SearchInputDropdown.defaultProps = {
  items: [],
  onSelect: () => undefined
};

export default SearchInputDropdown;
