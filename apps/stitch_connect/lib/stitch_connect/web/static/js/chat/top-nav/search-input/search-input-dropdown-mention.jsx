import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import cx from "classnames";
import { Avatar } from "common/components";

@inject("presenceStore", "usersStore")
@observer
class SearchInputDropdownMention extends Component {
  render() {
    const {
      itemId,
      isActive,
      presenceStore,
      onHover,
      onSelectItem,
      usersStore
    } = this.props;
    const user = usersStore.getUserById(itemId);

    if (!user) {
      return null;
    }

    const itemClassName = cx("search-input-dropdown-item", {
      active: isActive
    });
    const online = presenceStore.isOnline(itemId);

    return (
      <li
        className={itemClassName}
        onMouseEnter={onHover}
        onClick={onSelectItem}
      >
        <span className="item-icon">
          <i
            className={cx("fa", {
              "fa-circle": online,
              "fa-circle-o": !online
            })}
          />
        </span>
        <span className="item-text">
          <Avatar user={user} />
          <span className="username">{user.full_name}</span>
          <span className="text-muted">{user.username}</span>
        </span>
      </li>
    );
  }
}

SearchInputDropdownMention.propTypes = {
  itemId: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onHover: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired
};

export default SearchInputDropdownMention;
