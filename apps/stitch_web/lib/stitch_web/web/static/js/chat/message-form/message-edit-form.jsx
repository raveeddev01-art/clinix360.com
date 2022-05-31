import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import Textarea from "react-textarea-autosize";
import some from "lodash/some";

import { confirmModal } from "common/modals";
import EmojiPicker from "./components/emoji-picker";
import FormattingCommands from "./components/formatting-commands";
import EditingCommand from "./components/editing-command";
import MentionMenu from "./components/mention-menu";
import EmojiSearch from "./components/emoji-search";

@inject("socketStore", "uploadStore", "billingStore", "sidemenuStore")
@observer
class MessageEditForm extends Component {
  constructor(props) {
    super(props);

    this.applyTextStyle = this.applyTextStyle.bind(this);
    this.state = {
      text: this.getText(),
      searchFilter: "",
      openMentionMenu: false,
      openEmojiSearch: false,
      isFocused: true
    };
  }

  applyTextStyle(event, style) {
    const textStyles = {
      bold: "**",
      italic: "__",
      strike: "~~",
      highlight: "``",
      quote: "> "
    };

    var cursorStart = this.textInput.selectionStart;
    var cursorEnd = this.textInput.selectionEnd;
    var formatedText = textStyles[style]
    if (cursorStart != cursorEnd) {
      formatedText = textStyles[style][0] + this.getCurrentSelection() + textStyles[style][1];
    }

    this.insertWord(formatedText, 1);
    this.componentWillReceiveProps()
  }

  componentWillReceiveProps() {
    // if a modal is open, don't steal focus from it
    if (!this.props.sidemenuStore.currentModal) {
      this.textInput.focus();
    }
  }

  onTextChange = evt => {
    this.updateInputText(evt.target.value);
  };

  onKeyDown = evt => {
    const { openMentionMenu, openEmojiSearch } = this.state;
    if (
      ([37, 38, 39, 40].indexOf(evt.keyCode) > -1 &&
        (openMentionMenu || openEmojiSearch)) ||
      evt.keyCode === 13 ||
      evt.keyCode === 9
    ) {
      evt.preventDefault();
    }

    if (evt.keyCode === 13) {
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
    const { messageStore, socketStore, isReply } = this.props;

    // if not connected, just no send message at all
    if (!socketStore.isConnected) {
      return;
    }

    const trimmedText = this.state.text.trim();

    if(!trimmedText) {
      confirmModal({
        title: "Delete Message",
        message:
          "Are you sure you want to delete this message? This cannot be undone.",
        okLabel: "Delete"
      }).then(() => {
        messageStore.delete(messageStore.messageInEdit.id);
        messageStore.finishEdit();
      });
    } else {
      if (isReply) {
        messageStore.finishCommentEdit();
      } else {
        messageStore.finishEdit();
      }

      this.setState({ text: "" });
    }
  };

  onKeyUp = evt => {
    const { messageStore, allowMention } = this.props;
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
      if (!this.state.text && !messageInEdit) {
        messageStore.editLastMessage();
      }
    } else if ([37, 38, 39, 40].indexOf(evt.keyCode) > -1) {
      // Do nothing for arrow keys
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
          if (allowMention) {
            this.setState({
              searchFilter: filter,
              openMentionMenu: true,
              openEmojiSearch: false
            });
          }
          break;

        case ":":
          this.setState({
            searchFilter: filter,
            openMentionMenu: false,
            openEmojiSearch: true
          });
          break;

        default:
          break;
      }

      if (evt.keyCode !== 13 && this.props.allowTypingUsers) {
        this.typingStarted();
      }
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
    const { uploadStore, isEngage } = this.props;
    const items = evt.clipboardData.items;

    some(items, item => {
      const file = item.getAsFile();

      // browser only allows reading images. other files will be returned as null
      if (file) {
        const fileName = evt.clipboardData.getData("Text");
        uploadStore.openUploadModal(
          file,
          fileName,
          isEngage ? "engage" : "connect"
        );
        // NOTE: for now, we supports pasting only 1 file. Stacking can be done later.
        evt.preventDefault();
        return true;
      }

      return false;
    });
  };

  onFocus = () => {
    this.setState({ isFocused: true });
  };

  onBlur = () => {
    this.setState({ isFocused: false });
  };

  onCloseMentionMenu = () => {
    this.setState({
      openMentionMenu: false
    });
  };

  getText = () => {
    const { messageStore } = this.props;

    return messageStore.messageInEdit
      ? messageStore.textInEdit
      : this.state.text;
  };

  getCurrentWord = () => {
    const text = this.getText();
    const cursorPos = this.textInput.selectionStart;
    const preWord = text
      .substring(0, cursorPos)
      .match(/[:+\-@A-Za-z0-9_]*$/)[0];
    const postWord = text.substring(cursorPos).match(/^[:+\-A-Za-z0-9_]*/)[0];
    return `${preWord}${postWord}`;
  };

  getCurrentSelection = () => {
    return this.getText().substring(this.textInput.selectionStart, this.textInput.selectionEnd)
  }

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
    const { messageStore } = this.props;

    messageStore.startTyping();
  };

  insertWord = (word, setpBack = 0) => {
    const cursorPos = this.textInput.selectionStart;
    const text = this.getText();
    this.updateInputText(
      text.substring(0, this.textInput.selectionStart) +
      word +
      text.substring(this.textInput.selectionEnd)
    );

    setTimeout(() => {
      this.textInput.setSelectionRange(
        cursorPos + word.length - setpBack,
        cursorPos + word.length - setpBack
      );
      this.textInput.focus();
    });
  };

  replaceCurrentWord = word => {
    const cursorPos = this.textInput.selectionStart;
    const text = this.getText();
    const preWord = text
      .substring(0, cursorPos)
      .match(/[:+\-@A-Za-z0-9_]*$/)[0];
    const postWord = text.substring(cursorPos).match(/^[:+\-A-Za-z0-9_]*/)[0];
    const updatedMessage =
      text.substring(0, cursorPos - preWord.length) +
      word +
      text.substring(cursorPos + postWord.length);

    this.updateInputText(updatedMessage);
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

  startMention = () => {
    this.replaceCurrentWord("@");

    setTimeout(() => {
      this.setState({ openMentionMenu: true, openEmojiSearch: false });
    }, 100);
  };

  renderInput() {
    const {
      messageStore,
      socketStore,
      allowMention,
      inThread
    } = this.props;
    const { isFocused } = this.state;
    const text = this.getText();

    const className = classNames("form-control", "message-text", {
      disconnected: !socketStore.isConnected,
      editing: !!messageStore.messageInEdit 
    });

    const inputWrapperClass = classNames("message-input-wrapper", {
      isFocused: isFocused || messageStore.messageInEdit 
    });

    return (
      <div className={inputWrapperClass}>
        <Textarea
          style={{padding: "8px 68px 28px 14px"}}
          className={className}
          placeholder="Message"
          maxRows={30}
          maxLength="4000"
          value={text}
          onChange={this.onTextChange}
          onKeyUp={this.onKeyUp}
          onKeyDown={this.onKeyDown}
          onPaste={this.onPaste}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          autoFocus
          required
          ref={input => {
            if (input) {
              this.textInput = ReactDOM.findDOMNode(input);
            }
          }}
        />
        <div className="message-form-actions">
          {allowMention && (
            <a className="message-form-action-item" onClick={this.startMention}>
              <i className="fa fa-at" />
            </a>
          )}
          <EmojiPicker onSelectEmoji={this.insertWord} inThread={inThread} />
        </div>
      </div>
    );
  }

  render() {
    const { searchFilter, openMentionMenu, openEmojiSearch, text } = this.state;
    const {
      allowMention,
      messageStore,
      currentGroup,
      isReply
    } = this.props;

    return (
      <div className="flex-footer" style={{padding: "0px"}}>
        <div className="message-form">
          {allowMention &&
            openMentionMenu && (
              <MentionMenu
                currentGroup={currentGroup}
                filter={searchFilter}
                onSelect={this.onSelectMention}
                onClose={this.onCloseMentionMenu}
              />
            )}

          {openEmojiSearch && (
            <EmojiSearch filter={searchFilter} onSelect={this.onSelectEmoji} />
          )}

          <FormattingCommands applyStyleEvent={this.applyTextStyle} />
          {this.renderInput()}
          <EditingCommand messageStore={messageStore} isReply={isReply}/>

          {text.length > 3999 && (
            <div className="character-limit">
              You have reached the 4000 character limit per message.
            </div>
          )}
          </div>
      </div>
    );
  }
}

MessageEditForm.propTypes = {
  messageStore: PropTypes.object.isRequired,
  isEngage: PropTypes.bool.isRequired,
  allowTypingUsers: PropTypes.bool,
  allowMention: PropTypes.bool,
  allowJumpingIndicator: PropTypes.bool,
  currentGroup: PropTypes.object
};

MessageEditForm.defaultProps = {
  allowTypingUsers: true,
  allowMention: true,
  allowJumpingIndicator: true,
  isEngage: false,
  currentGroup: null
};

export default MessageEditForm;
