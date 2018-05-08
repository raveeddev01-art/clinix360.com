import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import cx from "classnames";

@inject("groupsStore")
@observer
class SearchInputDropdownRoom extends Component {
  render() {
    const { itemId, isActive, onMouseEnter, onSelectItem, groupsStore } = this.props;
    const group = groupsStore.getGroupById(itemId);

    if (!group) {
      return null;
    }

    const itemClassName = cx("search-input-dropdown-item", {
      active: isActive
    });

    return (
      <li
        className={itemClassName}
        onMouseEnter={onMouseEnter}
        onClick={onSelectItem}
      >
        <span className="item-icon">
          <i
            className={cx("fa", {
              "fa-link": group.type === "multi_dm",
              "fa-comments": group.type === "regular" && group.public,
              "fa-lock": group.type === "regular" && !group.public
            })}
          />
        </span>
        <span className="item-text">
          <span className="username">{groupsStore.getGroupName(group)}</span>
          {group.type === "regular" && (
            <span className="text-muted">{group.slug}</span>
          )}
        </span>
      </li>
    );
  }
}

SearchInputDropdownRoom.propTypes = {
  itemId: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired
};

export default SearchInputDropdownRoom;
