import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import cx from "classnames";

@inject("messageStore", "sidemenuStore", "groupStore", "presenceStore")
@observer
class MessageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      openMentionMenu: false,
      userFilter: "",
      activeUserIndex: 0
    };
  }

  onChangeMessage = evt => {
    this.setState({ message: evt.target.value });
  };

  onKeyUp = evt => {
    const { activeUserIndex, openMentionMenu, message } = this.state;

    if (evt.keyCode === 38) {
      // arrow up
      this.setState({ activeUserIndex: this.state.activeUserIndex - 1 });
    } else if (evt.keyCode === 40) {
      // arrow down
      this.setState({ activeUserIndex: this.state.activeUserIndex + 1 });
    } else if (evt.keyCode === 13) {
      // enter
      // check if user mention menu is open first
      if (openMentionMenu) {
        const users = this.getUsers();
        if (users.length) {
          const selectedUser =
            users[
              (activeUserIndex % users.length + users.length) % users.length
            ];

          this.replaceCurrentWord(`@${selectedUser.username} `);
          return;
        }
      }

      // otherwise sends message
      if (this.state.message) {
        this.props.messageStore.sendMessage(this.state.message).then(() => {
          this.setState({ message: "" });
        });
      }
    } else if (evt.keyCode === 27) {
      this.setState({ openMentionMenu: false });
    } else {
      // other keys
      // get the word of current cursor
      const word = this.getCurrentWord();

      // wants to mention another user
      if (word.substr(0, 1) === "@") {
        const filter = word.substr(1);
        this.setState({
          userFilter: filter,
          openMentionMenu: true
        });
      } else {
        this.setState({
          userFilter: "",
          openMentionMenu: false
        });
      }
    }
  };

  onUserItemHover = index => () => {
    this.setState({ activeUserIndex: index });
  };

  onSelectMention = username => () => {
    this.replaceCurrentWord(`@${username} `);
  };

  getUsers = () => {
    const { groupStore, sidemenuStore } = this.props;
    const { userFilter } = this.state;

    const users = groupStore.public ? groupStore.users : sidemenuStore.users;
    return users
      .filter(
        user =>
          `${user.first_name} ${user.last_name} ${user.username}`.indexOf(
            userFilter
          ) > -1
      )
      .slice(0, 5);
  };

  getCurrentWord = () => {
    const cursorPos = parseInt(this.ctrl.selectionStart || 0, 10);
    const str = this.state.message;
    const preWord = str.substring(0, cursorPos).match(/[@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[A-Za-z0-9_]*/)[0];
    return `${preWord}${postWord}`;
  };

  replaceCurrentWord = word => {
    const cursorPos = parseInt(this.ctrl.selectionStart || 0, 10);
    const str = this.state.message;
    const preWord = str.substring(0, cursorPos).match(/[@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[A-Za-z0-9_]*/)[0];
    const updatedMsg =
      str.substring(0, cursorPos - preWord.length) +
      word +
      str.substring(cursorPos + postWord.length);

    this.setState({ message: updatedMsg, openMentionMenu: false }, () => {
      // after replacing, the cursor pos should be persistent
      const newPos = cursorPos - preWord.length + word.length;
      this.ctrl.focus();
      this.ctrl.setSelectionRange(newPos, newPos);
    });
  };

  render() {
    const { presenceStore } = this.props;
    const { message, openMentionMenu, activeUserIndex } = this.state;

    const users = this.getUsers();

    const dropUpClassName = cx("dropup", "user-mention-menu", {
      open: openMentionMenu && users.length
    });

    return (
      <div className="message-form">
        <div className={dropUpClassName}>
          <ul className="dropdown-menu">
            {users.map((user, index) => {
              const online = presenceStore.isOnline(`${user.id}`);
              const itemClassName = cx("user-list-item", {
                active:
                  (activeUserIndex % users.length + users.length) %
                    users.length ===
                  index
              });
              return (
                <li
                  key={`user_${user.id}`}
                  className={itemClassName}
                  onMouseEnter={this.onUserItemHover(index)}
                  onClick={this.onSelectMention(user.username)}
                >
                  <span className="item-icon">
                    {online
                      ? <i className="fa fa-circle" />
                      : <i className="fa fa-circle-o" />}
                  </span>
                  <span className="item-text">
                    <span>{`${user.first_name} ${user.last_name}`}</span>
                    <small>
                      {user.username}
                    </small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <input
          className="form-control"
          type="text"
          placeholder="Write something"
          value={message}
          onChange={this.onChangeMessage}
          onKeyUp={this.onKeyUp}
          autoFocus
          ref={c => {
            this.ctrl = c;
          }}
          required
        />
      </div>
    );
  }
}

export default MessageForm;
