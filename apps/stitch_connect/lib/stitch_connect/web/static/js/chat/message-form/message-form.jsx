import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import InsertMenu from "./components/insert-menu";
import EmojiPicker from "./components/emoji-picker";
import TypingUsers from "./components/typing-users";
import JumpingIndicator from "./components/jumping-indicator";
import EditingCommand from "./components/editing-command";
import MentionMenu from "./components/mention-menu";

@inject("messageStore")
@observer
class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      openMentionMenu: false,
      userFilter: ""
    };

    this.typingTimeoutId = null;
  }

  onTextChange = evt => {
    this.updateInputText(evt.target.value);
  };

  onKeyUp = evt => {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;
    const { openMentionMenu } = this.state;

    if (evt.keyCode === 13) {
      // enter

      if (!openMentionMenu) {
        if (messageInEdit) {
          messageStore.finishEdit();
        } else if (this.state.text) {
          this.props.messageStore.sendMessage(this.state.text).then(() => {
            this.setState({ text: "" });
            this.typingStopped();
          });
        }
      }
    } else if (evt.keyCode === 27) {
      // escape

      if (openMentionMenu) {
        this.setState({ openMentionMenu: false });
      } else if (messageInEdit) {
        messageStore.cancelEdit();
      }
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

      this.typingStarted();
    }
  };

  onSelectMention = username => {
    this.replaceCurrentWord(`@${username} `);
  };

  getText = () => {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;
    let { text: str } = this.state;

    if (messageInEdit) {
      str = messageStore.textInEdit;
    }

    return str;
  };

  getCurrentWord = () => {
    const str = this.getText();
    const cursorPos = parseInt(this.textInput.selectionStart || 0, 10);
    const preWord = str.substring(0, cursorPos).match(/[@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[A-Za-z0-9_]*/)[0];
    return `${preWord}${postWord}`;
  };

  updateInputText = value => {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;

    if (messageInEdit) {
      messageStore.editText(value);
    } else {
      this.setState({ text: value });
    }
  };

  typingStarted = () => {
    this.props.messageStore.startTyping();
  };

  typingStopped = () => {
    this.props.messageStore.stopTyping();
  };

  insertWord = word => {
    const cursorPos = parseInt(this.textInput.selectionStart || 0, 10);
    const str = this.getText();
    this.updateInputText(
      str.substring(0, cursorPos) + word + str.substring(cursorPos)
    );
    this.textInput.focus();
  };

  replaceCurrentWord = word => {
    const cursorPos = parseInt(this.textInput.selectionStart || 0, 10);
    const str = this.getText();
    const preWord = str.substring(0, cursorPos).match(/[@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[A-Za-z0-9_]*/)[0];
    const updatedMsg =
      str.substring(0, cursorPos - preWord.length) +
      word +
      str.substring(cursorPos + postWord.length);

    this.updateInputText(updatedMsg);
    this.setState({ openMentionMenu: false }, () => {
      // after replacing, the cursor pos should be persistent
      const newPos = cursorPos - preWord.length + word.length;
      this.textInput.focus();
      this.textInput.setSelectionRange(newPos, newPos);
    });
  };

  renderInput() {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;

    if (messageInEdit) {
      this.textInput.focus();
    }

    const text = this.getText();
    const className = classNames("form-control", "message-text", {
      editing: !!messageInEdit
    });

    return (
      <div className="message-input-wrapper">
        <input
          className={className}
          type="text"
          placeholder="Message"
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
          <EmojiPicker onSelectEmoji={this.insertWord} />
        </div>
      </div>
    );
  }

  render() {
    const { openMentionMenu, userFilter } = this.state;
    return (
      <div className="message-form">
        <JumpingIndicator />
        <MentionMenu
          isOpen={openMentionMenu}
          filter={userFilter}
          onSelect={this.onSelectMention}
        />
        {this.renderInput()}
        <TypingUsers />
        <EditingCommand />
      </div>
    );
  }
}

export default MessageForm;
