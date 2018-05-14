import React, { Component } from "react";
import PropTypes from "prop-types";
import groupBy from "lodash/groupBy";
import SearchInputDropdownMention from "./search-input-dropdown-mention";
import SearchInputDropdownRoom from "./search-input-dropdown-room";

class SearchInputDropdown extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      activeIndex: 0,
      isActive: true
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onActive = index => () => {
    this.setState({ activeIndex: index, isActive: true });
  };

  onInactive = () => {
    this.setState({ isActive: false });
  };

  onSelectItem = value => () => {
    const { onSelect } = this.props;
    onSelect(value);
  };

  onKeyDown = evt => {
    const { activeIndex } = this.state;
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

  getItems = () => {
    if (this.props.title === "People") {
      return this.props.items.slice(0, 10);
    }

    const groupedItems = groupBy(this.props.items, "groupType");
    const items = [];
    ["Rooms", "Direct Messages"].forEach(groupType => {
      if (groupedItems[groupType]) {
        items.push(...groupedItems[groupType].slice(0, 5));
      }
    });

    return items;
  };

  renderItems(items, offset = 0) {
    const { activeIndex, isActive } = this.state;
    return items.map((item, index) => {
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
            isActive={activeIndex === index + offset && isActive}
            onMouseEnter={this.onActive(index + offset)}
            onSelectItem={this.onSelectItem(item.value)}
          />
        );
      }

      return null;
    });
  }

  renderMentions() {
    const menuItems = this.getItems();
    return <div className="menu-content">{this.renderItems(menuItems)}</div>;
  }

  renderRooms() {
    const groupedItems = groupBy(this.getItems(), "groupType");
    let offset = 0;

    return (
      <div className="menu-content">
        {Object.keys(groupedItems).map((groupType, i) => {
          const items = groupedItems[groupType];
          const menuItems = this.renderItems(items, offset);

          offset += items.length;

          return [
            <li className="dropdown-header" key={`header_${groupType}`}>
              {groupType}
            </li>,
            ...menuItems,
            i < Object.keys(groupedItems).length - 1 && (
              <li className="divider" key={`divider_${i}`} />
            )
          ];
        })}
      </div>
    );
  }

  render() {
    const { items, title } = this.props;
    if (!items || !items.length) {
      return null;
    }
    return (
      <div className="search-input-menu open">
        <ul className="dropdown-menu" onMouseLeave={this.onInactive}>
          <div className="menu-header">{title}</div>
          {title === "People" ? this.renderMentions() : this.renderRooms()}
        </ul>
      </div>
    );
  }
}

SearchInputDropdown.propTypes = {
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

SearchInputDropdown.defaultProps = {
  items: [],
  title: "",
  onSelect: () => undefined
};

export default SearchInputDropdown;
