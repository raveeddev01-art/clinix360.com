import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import cx from "classnames";
import { Avatar } from "common/components";
import noop from "lodash/noop";

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

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter) {
      this.setState({ activeUserIndex: 0 });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onUserItemHover = index => () => {
    this.setState({ activeUserIndex: index });
  };

  onSelectMention = username => () => {
    const { onSelect } = this.props;

    onSelect(username);
  };

  onKeyDown = evt => {
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
      case 9: // tab
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
    const { presenceStore } = this.props;
    const { activeUserIndex } = this.state;
    const users = this.getUsers();
    if (!users.length) {
      return null;
    }

    return (
      <div className="dropup user-mention-menu open">
        <div className="dropdown-mask" onClick={this.props.onClose} />

        <ul className="dropdown-menu">
          <div className="menu-header">People</div>

          <div className="menu-content">
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
                      <span className="username">{user.username}</span>
                      <span className="text-muted">{user.description}</span>
                    </span>
                  ) : (
                    <span className="item-text">
                      <Avatar user={user} />
                      <span className="username">{user.full_name}</span>
                      <span className="text-muted">{user.username}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </div>
        </ul>
      </div>
    );
  }
}

MenutionMenu.propTypes = {
  filter: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

MenutionMenu.defaultProps = {
  filter: "",
  onSelect: noop,
  onClose: noop
};

export default MenutionMenu;
