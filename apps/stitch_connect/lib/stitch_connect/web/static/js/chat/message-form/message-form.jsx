import React, { Component } from "react";
import ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import Textarea from "react-textarea-autosize";

import InsertMenu from "./components/insert-menu";
import EmojiPicker from "./components/emoji-picker";
import TypingUsers from "./components/typing-users";
import JumpingIndicator from "./components/jumping-indicator";
import EditingCommand from "./components/editing-command";
import MentionMenu from "./components/mention-menu";
import EmojiSearch from "./components/emoji-search";
import { confirm } from "../../common/modals";

@inject("messageStore", "socketStore", "uploadStore")
@observer
class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      openMentionMenu: false,
      searchFilter: "",
      openEmojiSearch: false
    };

    this.typingTimeoutId = null;
  }

  onTextChange = evt => {
    this.updateInputText(evt.target.value);
  };

  onKeyDown = evt => {
    const { openMentionMenu, openEmojiSearch } = this.state;
    if (
      [37, 38, 39, 40, 13].indexOf(evt.keyCode) > -1 &&
      (openMentionMenu || openEmojiSearch)
    ) {
      evt.preventDefault();
    }

    if (evt.keyCode === 13) {
      evt.preventDefault();

      if (
        (evt.altKey && !evt.ctrlKey && !evt.shiftKey) ||
        (!evt.altKey && evt.ctrlKey && !evt.shiftKey) ||
        (!evt.altKey && !evt.ctrlKey && evt.shiftKey)
      ) {
        this.newLine();
      } else if (!openMentionMenu && !openEmojiSearch) {
        this.onEnter();
      }
    }
  };

  onEnter = () => {
    const { messageStore } = this.props;

    if (messageStore.messageInEdit) {
      if (!messageStore.textInEdit) {
        confirm({
          title: "Delete Message",
          message:
            "Are you sure you want to delete this message? This cannot be undone.",
          okLabel: "Delete"
        }).then(() => {
          messageStore.delete(messageStore.messageInEdit.id);
          messageStore.finishEdit();
        });
      } else {
        messageStore.finishEdit();
      }
    } else if (this.state.text) {
      this.props.messageStore.sendMessage(this.state.text.trim()).then(() => {
        this.props.messageStore.updateGroupCursor(null);
        this.setState({ text: "" });
        this.typingStopped();
      });
    }
  };

  onKeyUp = evt => {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;
    const { openMentionMenu, openEmojiSearch } = this.state;

    if (evt.keyCode === 27) {
      // escape
      if (openMentionMenu || openEmojiSearch) {
        this.setState({ openMentionMenu: false, openEmojiSearch: false });
      } else if (messageInEdit) {
        messageStore.cancelEdit();
      }
    } else if (evt.keyCode === 38) {
      // Up arrow
      if (!this.state.text) {
        messageStore.editLastMessage();
      }
    } else {
      // other keys
      // get the word of current cursor
      const word = this.getCurrentWord();
      const firstLetter = word.substr(0, 1);
      const filter = word.substr(1);
      this.setState({
        searchFilter: "",
        openMentionMenu: false,
        openEmojiSearch: false
      });

      switch (firstLetter) {
        case "@":
          this.setState({ searchFilter: filter, openMentionMenu: true });
          break;
        case ":":
          this.setState({ searchFilter: filter, openEmojiSearch: true });
          break;
        default:
      }

      this.typingStarted();
    }
  };

  onSelectMention = username => {
    if (username) {
      this.replaceCurrentWord(`@${username} `);
    } else {
      this.onEnter();
    }
    this.setState({ searchFilter: "", openMentionMenu: false });
  };

  onSelectEmoji = emoji => {
    if (emoji) {
      this.replaceCurrentWord(`${emoji} `);
    } else {
      this.onEnter();
    }
    this.setState({ searchFilter: "", openEmojiSearch: false });
  };

  onPaste = evt => {
    const items = evt.clipboardData.items;
    for (let i = 0; i < items.length; i += 1) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        // browser only allows reading images. other files will be returned as null
        if (file) {
          const fileName = evt.clipboardData.getData("Text");
          this.props.uploadStore.openUploadModal(file, fileName);
          // NOTE: for now, we supports pasting only 1 file. Stacking can be done later.
          evt.preventDefault();
          break;
        }
      }
    }
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
    const cursorPos = this.textInput.selectionStart;
    const preWord = str.substring(0, cursorPos).match(/[:+\-@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[:+\-A-Za-z0-9_]*/)[0];
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
    const cursorPos = this.textInput.selectionStart;
    const str = this.getText();
    this.updateInputText(
      str.substring(0, this.textInput.selectionStart) +
        word +
        str.substring(this.textInput.selectionEnd)
    );

    setTimeout(() => {
      this.textInput.setSelectionRange(cursorPos + 1, cursorPos + 1);
      this.textInput.focus();
    });
  };

  replaceCurrentWord = word => {
    const cursorPos = this.textInput.selectionStart;
    const str = this.getText();
    const preWord = str.substring(0, cursorPos).match(/[:+\-@A-Za-z0-9_]*$/)[0];
    const postWord = str.substring(cursorPos).match(/^[:+\-A-Za-z0-9_]*/)[0];
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

  newLine = () => {
    const { messageStore } = this.props;

    this.insertWord("\n");

    setTimeout(() => {
      // Ensure cursor is in viewport
      this.textInput.blur();
      this.textInput.focus();

      // Keep message list's scroll at bottom if at bottom
      messageStore.keepScrollAtBottom();
    });
  };

  renderInput() {
    const { messageStore, socketStore } = this.props;
    const { messageInEdit } = messageStore;

    if (messageInEdit) {
      this.textInput.focus();
    }

    const text = this.getText();
    const className = classNames("form-control", "message-text", {
      editing: !!messageInEdit || !socketStore.isConnected
    });

    return (
      <div className="message-input-wrapper">
        <Textarea
          className={className}
          placeholder="Message"
          maxRows={6}
          value={text}
          onChange={this.onTextChange}
          onKeyUp={this.onKeyUp}
          onKeyDown={this.onKeyDown}
          onPaste={this.onPaste}
          autoFocus
          required
          ref={input => {
            this.textInput = ReactDOM.findDOMNode(input);
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
    const { openMentionMenu, searchFilter, openEmojiSearch } = this.state;
    return (
      <div className="message-form">
        <JumpingIndicator />
        <MentionMenu
          isOpen={openMentionMenu}
          filter={searchFilter}
          onSelect={this.onSelectMention}
        />
        <EmojiSearch
          isOpen={openEmojiSearch}
          filter={searchFilter}
          onSelect={this.onSelectEmoji}
        />
        {this.renderInput()}
        <TypingUsers />
        <EditingCommand />
      </div>
    );
  }
}

export default MessageForm;
