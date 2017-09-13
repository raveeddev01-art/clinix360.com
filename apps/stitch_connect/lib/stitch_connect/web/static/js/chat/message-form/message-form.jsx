import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import moment from "moment";

import InsertMenu from "./insert-menu";

@inject(
  "messageStore",
  "sidemenuStore",
  "groupStore",
  "presenceStore",
  "groupPresenceStore",
  "channelStore"
)
@observer
class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      openMentionMenu: false,
      userFilter: "",
      activeUserIndex: 0
    };

    this.typingTimoutId = null;
  }

  onTextChange = evt => {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;
    const { value } = evt.target;

    if (messageInEdit) {
      messageStore.editText(value);
    } else {
      this.setState({ text: value });
    }
  };

  onKeyUp = evt => {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;
    const { activeUserIndex, openMentionMenu } = this.state;

    if (evt.keyCode === 38) {
      // arrow up

      if (messageInEdit) {
        return;
      }

      this.setState({ activeUserIndex: this.state.activeUserIndex - 1 });
    } else if (evt.keyCode === 40) {
      // arrow down

      if (messageInEdit) {
        return;
      }

      this.setState({ activeUserIndex: this.state.activeUserIndex + 1 });
    } else if (evt.keyCode === 13) {
      // enter

      if (messageInEdit) {
        this.finishEdit();
        return;
      }

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
      if (this.state.text) {
        this.props.messageStore.sendMessage(this.state.text).then(() => {
          this.setState({ text: "" });
          this.typingStopped();
        });
      }
    } else if (evt.keyCode === 27) {
      // escape

      if (messageInEdit) {
        this.cancelEdit();
        return;
      }

      this.setState({ openMentionMenu: false });
    } else {
      // other keys

      if (messageInEdit) {
        return;
      }

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

      this.typingStarted();
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

    const users = groupStore.public ? sidemenuStore.users : groupStore.users;
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
    const cursorPos = parseInt(this.textInput.selectionStart || 0, 10);
    const str = this.state.text;
    const preWord = str.substring(0, cursorPos).match(/[@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[A-Za-z0-9_]*/)[0];
    return `${preWord}${postWord}`;
  };

  typingStarted = () => {
    clearTimeout(this.typingTimoutId);
    this.props.channelStore.groupChannel.push("typing_started");
    this.typingTimoutId = setTimeout(this.typingStopped, 5000);
  };

  typingStopped = () => {
    this.props.channelStore.groupChannel.push("typing_stopped");
  };

  replaceCurrentWord = word => {
    const cursorPos = parseInt(this.textInput.selectionStart || 0, 10);
    const str = this.state.text;
    const preWord = str.substring(0, cursorPos).match(/[@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[A-Za-z0-9_]*/)[0];
    const updatedMsg =
      str.substring(0, cursorPos - preWord.length) +
      word +
      str.substring(cursorPos + postWord.length);

    this.setState({ text: updatedMsg, openMentionMenu: false }, () => {
      // after replacing, the cursor pos should be persistent
      const newPos = cursorPos - preWord.length + word.length;
      this.textInput.focus();
      this.textInput.setSelectionRange(newPos, newPos);
    });
  };

  finishEdit = () => {
    const { messageStore } = this.props;

    messageStore.finishEdit();
  };

  cancelEdit = () => {
    const { messageStore } = this.props;

    messageStore.cancelEdit();
  };

  renderJumpedMessageIndicator() {
    const { messageStore } = this.props;
    const { messageJumpedTo } = messageStore;

    return (
      messageStore.showJumpedMessageIndicator &&
      <div
        role="button"
        className="jumped-message-indicator"
        onClick={() => {
          messageStore.scrollToBottom();
        }}
      >
        <span className="timestamp">
          Viewing messages from{" "}
          {moment(messageJumpedTo.inserted_at).format("MMM Do, YYYY")}
        </span>
        <span className="scroll-to-bottom">
          Jump to recent messages <i className="fa fa-arrow-down" />
        </span>
      </div>
    );
  }

  renderMentionMenu() {
    const { messageStore, presenceStore } = this.props;
    const { openMentionMenu, activeUserIndex } = this.state;
    const users = this.getUsers();

    if (messageStore.messageInEdit || !openMentionMenu || !users.length) {
      return null;
    }

    return (
      <div className="dropup user-mention-menu open">
        <ul className="dropdown-menu">
          {users.map((user, index) => {
            const online = presenceStore.isOnline(user.id);
            const itemClassName = classNames("user-list-item", {
              active: (activeUserIndex + users.length) % users.length === index
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
    );
  }

  renderInput() {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;

    if (messageInEdit) {
      this.textInput.focus();
    }

    const text = messageInEdit ? messageStore.textInEdit : this.state.text;
    const className = classNames("form-control", "message-text", {
      editing: !!messageInEdit
    });

    return (
      <div className="message-input-wrapper">
        <input
          className={className}
          type="text"
          placeholder="Write something"
          value={text}
          onChange={this.onTextChange}
          onKeyUp={this.onKeyUp}
          autoFocus
          required
          ref={input => {
            this.textInput = input;
          }}
        />
        <div className="message-form-actions">
          <InsertMenu />
        </div>
      </div>
    );
  }

  renderTypingUsers() {
    const { groupPresenceStore: { typingUsers }, presenceStore } = this.props;
    let content;
    const username = id => presenceStore.onlineUsersMap[id].metas[0].username;

    switch (typingUsers.length) {
      case 0:
        content = <span>&nbsp;</span>;
        break;
      case 1:
        content = `${username(typingUsers[0])} is typing...`;
        break;
      case 2:
        content = `${typingUsers.map(username).join(" and ")} are typing...`;
        break;
      default:
        content = "multiple people are typing...";
    }

    return (
      <div>
        {content}
      </div>
    );
  }

  renderEditingCommands() {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;

    return (
      messageInEdit &&
      <div className="editing-commands">
        <div className="editing-commands-cancel">
          <kbd>Esc</kbd> to{" "}
          <button
            type="button"
            className="btn-fancy btn-default btn-small"
            onClick={this.cancelEdit}
          >
            Cancel editing
          </button>
        </div>
        <div className="editing-commands-save">
          <kbd>Enter</kbd> to{" "}
          <button
            type="button"
            className="btn-fancy btn-default btn-small"
            onClick={this.finishEdit}
          >
            Save changes
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="message-form">
        {this.renderJumpedMessageIndicator()}
        {this.renderMentionMenu()}
        {this.renderInput()}
        {this.renderTypingUsers()}
        {this.renderEditingCommands()}
      </div>
    );
  }
}

export default MessageForm;
