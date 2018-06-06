import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import cx from "classnames";

@inject("groupsStore", "presenceStore")
@observer
class SearchInputDropdownRoom extends Component {
  render() {
    const {
      itemId,
      isActive,
      onMouseEnter,
      onSelectItem,
      groupsStore,
      presenceStore
    } = this.props;
    const group = groupsStore.getGroupById(itemId);

    if (!group) {
      return null;
    }

    const otherUser = group.users.find(user => user.id !== currentUser.id);
    const online = !otherUser || presenceStore.isOnline(otherUser.id);

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
              "fa-circle": group.type === "dm" && online,
              "fa-circle-o": group.type === "dm" && !online,
              "fa-comments": group.type === "regular" && group.public,
              "fa-lock": group.type === "regular" && !group.public
            })}
          />
        </span>
        <span className="item-text">
          <span className="username">{groupsStore.getGroupName(group)}</span>
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
