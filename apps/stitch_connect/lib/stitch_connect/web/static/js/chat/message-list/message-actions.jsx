import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import cx from "classnames";
import { confirmModal } from "common/modals";
import ButtonGroup from "react-bootstrap/lib/ButtonGroup";
import Button from "react-bootstrap/lib/Button";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";
import { ReactionPicker } from "common/components";

@inject("messageStore")
class MessageActions extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dropup: false,
      isEmojiPickerOpen: false
    };
  }

  onToggleContextualMenu = isOpen => {
    const { messageStore, message, toggleSelected } = this.props;
    const { chatDiv } = messageStore;
    const messageDiv = messageStore.messageElements[message.id].div;

    toggleSelected(isOpen);

    if (isOpen) {
      this.setState({
        dropup:
          chatDiv.scrollTop + chatDiv.offsetHeight / 2 < messageDiv.offsetTop
      });
    }
  };

  onSelectEmoji = emoji => {
    const { messageStore, message, toggleSelected } = this.props;
    toggleSelected(false);
    this.setState({ isEmojiPickerOpen: false }, () => {
      if (emoji) {
        messageStore.toggleReaction(message.id, emoji.colons);
      }
    });
  };

  getEmojiMartStyle = () => {
    const martStyles = {};
    const { messageStore, message } = this.props;
    const messageDiv = messageStore.messageElements[message.id].div;

    if (!messageDiv) {
      return {};
    }

    const pos = messageDiv.getBoundingClientRect();
    if (pos.bottom < window.innerHeight / 2) {
      martStyles.top = "24px";
    } else {
      martStyles.bottom = "calc(100% + 14px)";
    }

    return martStyles;
  };

  showInfoModal = () => {
    const { message, messageStore } = this.props;
    messageStore.infoModalMessageId = message.id;
  };

  copy = () => {
    // Callback to run when message is copied
  };

  togglePin = () => {
    const { messageStore, message } = this.props;

    messageStore.togglePin(message.id);
  };

  toggleStar = () => {
    const { messageStore, message } = this.props;

    messageStore.toggleStar(message.id);
  };

  toggleReaction = () => {
    this.props.toggleSelected(true);
    this.setState({ isEmojiPickerOpen: true });
  };

  markAsUnread = () => {
    const { message, messageStore } = this.props;

    messageStore.markAsUnread(message.id);
  };

  edit = () => {
    const { message, messageStore } = this.props;

    messageStore.startEdit(message.id);
  };

  delete = () => {
    confirmModal({
      title: "Delete Message",
      message:
        "Are you sure you want to delete this message? This cannot be undone.",
      okLabel: "Delete"
    }).then(() => {
      const { message, messageStore } = this.props;

      messageStore.delete(message.id);
    });
  };

  render() {
    const { messageStore, message } = this.props;
    const mine = message.user.id === currentUser.id;
    const unsent = message.sent === false;
    const { dropup, isEmojiPickerOpen } = this.state;
    const starredCX = message.starred ? "" : "-o";

    // disabling context menu
    if (unsent) {
      return null;
    }

    return [
      <ButtonGroup
        id="message-actions"
        className="message-actions"
        key="message-actions"
      >
        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="message-info">Message info</Tooltip>}
        >
          <Button onClick={this.showInfoModal}>
            <i className="fa fa-info" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="message-react">Add reaction</Tooltip>}
        >
          <Button onClick={this.toggleReaction}>
            <i className="fa fa-smile-o" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          shouldUpdatePosition
          overlay={
            <Tooltip id="message-star">
              {message.starred ? "Unstar" : "Star"} message
            </Tooltip>
          }
        >
          <Button onClick={this.toggleStar}>
            <i className={cx("fa", `fa-star${starredCX}`)} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          shouldUpdatePosition
          overlay={
            <Tooltip id="message-pin">
              {message.pinned ? "Unpin" : "Pin"} message
            </Tooltip>
          }
        >
          <Button onClick={this.togglePin}>
            <i className="fa fa-thumb-tack fa-rotate-45" />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          delayShow={150}
          overlay={<Tooltip id="message-actions">More</Tooltip>}
        >
          <DropdownButton
            dropup={dropup}
            pullRight
            noCaret
            title={<i className="fa fa-ellipsis-h" />}
            id="actions-dropdown"
            onToggle={this.onToggleContextualMenu}
          >
            {(!mine || message.id < messageStore.lastOtherUserMessage.id) && (
                <MenuItem onClick={this.markAsUnread}>
                  <span>
                    <i className="fa fa-circle" />&nbsp;Mark as unread
                  </span>
                </MenuItem>
              )}

            <CopyToClipboard text={message.text_content} onCopy={this.copy}>
              <MenuItem>
                <span>
                  <i className="fa fa-paste" />&nbsp;Copy message
                </span>
              </MenuItem>
            </CopyToClipboard>

            {mine && <MenuItem divider />}

            {mine && (
              <MenuItem onClick={this.edit}>
                <span>
                  <i className="fa fa-pencil" />&nbsp;Edit message
                </span>
              </MenuItem>
            )}

            {mine && (
              <MenuItem onClick={this.delete}>
                <span>
                  <i className="fa fa-trash" />&nbsp;Delete message
                </span>
              </MenuItem>
            )}
          </DropdownButton>
        </OverlayTrigger>
      </ButtonGroup>,

      <ReactionPicker
        key="reaction-picker"
        message={message}
        onSelectReaction={this.onSelectEmoji}
        show={isEmojiPickerOpen}
        style={this.getEmojiMartStyle()}
      />
    ];
  }
}

MessageActions.propTypes = {
  toggleSelected: PropTypes.func.isRequired,
  message: PropTypes.object.isRequired
};

export default MessageActions;
