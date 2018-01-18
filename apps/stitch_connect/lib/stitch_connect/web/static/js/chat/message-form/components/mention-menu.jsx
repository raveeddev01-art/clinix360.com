import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import { filterUsers, isFullMember } from "lib/utils";

@inject("presenceStore", "usersStore", "groupsStore")
@observer
class MenutionMenu extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      activeUserIndex: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
      document.addEventListener("keyup", this.onKeyUp);
      this.setState({ activeUserIndex: 0 });
    } else if (this.props.isOpen && !nextProps.isOpen) {
      document.removeEventListener("keyup", this.onKeyUp);
    }

    if (this.props.filter !== nextProps.filter) {
      this.setState({ activeUserIndex: 0 });
    }
  }

  onUserItemHover = index => () => {
    this.setState({ activeUserIndex: index });
  };

  onSelectMention = username => () => {
    this.props.onSelect(username);
  };

  onKeyUp = evt => {
    const { activeUserIndex } = this.state;
    const users = this.getUsers();

    switch (evt.keyCode) {
      case 38: // arrow up
        this.setState({
          activeUserIndex:
            activeUserIndex - 1 >= 0 ? activeUserIndex - 1 : users.length - 1
        });
        break;
      case 40: // arrow down
        this.setState({
          activeUserIndex:
            activeUserIndex + 1 >= users.length ? 0 : activeUserIndex + 1
        });
        break;
      case 13: // return
        if (users.length) {
          const selectedUser = users[activeUserIndex];
          this.onSelectMention(selectedUser.username)();
        } else {
          this.onSelectMention("")();
        }
        break;
      default:
    }
  };

  getUsers = () => {
    const { usersStore, filter, groupsStore: { currentGroup } } = this.props;
    const users = [];

    if (currentGroup.is_default) {
      users.push({
        username: "everyone",
        description: "Notifies everyone in the team",
        isGroupMention: true
      });
    }

    if (currentGroup.type === "regular") {
      users.push(
        {
          username: "here",
          description: "Notifies online people in the room",
          isGroupMention: true
        },
        {
          username: "room",
          description: "Notifies everyone in the room",
          isGroupMention: true
        }
      );
    }

    return filterUsers(
      [
        ...users,
        ...(isFullMember(currentUser)
          ? usersStore.activatedUsers
          : usersStore.connectedAndActivatedUsers)
      ],
      filter
    )
      .filter(user => !user.disabled)
      .slice(0, 10);
  };

  render() {
    const { presenceStore, isOpen } = this.props;
    const { activeUserIndex } = this.state;
    const users = this.getUsers();

    if (!isOpen || !users.length) {
      return null;
    }

    return (
      <div className="dropup user-mention-menu open">
        <ul className="dropdown-menu">
          {users.map((user, index) => {
            const online = presenceStore.isOnline(user.id);
            const itemClassName = cx("user-list-item", {
              active: activeUserIndex === index
            });

            return (
              <li
                key={`user_${user.username}`}
                className={itemClassName}
                onMouseEnter={this.onUserItemHover(index)}
                onClick={this.onSelectMention(user.username)}
              >
                <span className="item-icon">
                  <i
                    className={cx("fa", {
                      "fa-bullhorn": user.isGroupMention,
                      "fa-circle": !user.isGroupMention && online,
                      "fa-circle-o": !user.isGroupMention && !online
                    })}
                  />
                </span>
                {user.isGroupMention ? (
                  <span className="item-text">
                    <span>{user.username}</span>
                    <small>{user.description}</small>
                  </span>
                ) : (
                  <span className="item-text">
                    <span>{user.full_name}</span>
                    <small>{user.username}</small>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

MenutionMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  filter: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

MenutionMenu.defaultProps = {
  isOpen: false,
  filter: "",
  onSelect: () => {}
};

export default MenutionMenu;
