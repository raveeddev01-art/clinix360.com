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
import { isAdmin, getFullUrl } from "../../lib/utils";

@inject("teamFileStore", "addonStore")
class MessageActions extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dropup: false,
      isEmojiPickerOpen: false,
      emojiPickerOffset: {}
    };
  }

  onToggleContextualMenu = isOpen => {
    const { messageStore, message, setSelected } = this.props;
    const { chatDiv } = messageStore;
    const messageDiv = messageStore.messageElements[message.id].div;

    setSelected({ isSelected: isOpen });

    if (isOpen) {
      this.setState({
        dropup:
          chatDiv.scrollTop + chatDiv.offsetHeight / 2 < messageDiv.offsetTop
      });
    }
  };

  subscribeMessageNotifications = () => {
    const { messageStore, message, user } = this.props;
    messageStore.subscribeMessageNotifications(message, user.id, true);
  }

  unsubscribeMessageNotifications = () => {
    const { messageStore, message, user } = this.props;
    messageStore.subscribeMessageNotifications(message, user.id, false);
  }

  onSelectEmoji = emoji => {
    const { messageStore, message, setSelected } = this.props;
    this.setState({ isEmojiPickerOpen: false }, () => {
      if (emoji) {
        messageStore.toggleReaction(message.id, emoji.colons, message.group_id);
      }
      setSelected({ isSelected: false, isActionsVisible: false });
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
      martStyles.bottom = "-14px";
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

  toggleReaction = (e) => {
    this.setState({ emojiPickerOffset: e.target.getBoundingClientRect(), isEmojiPickerOpen: true })
    this.props.setSelected({ isSelected: true });
  };

  shareMessage = () => {
    const { message, messageStore } = this.props;
    messageStore.openShareModal(message.id);
  };

  showMessageComments = () => {
    const { addonStore, message } = this.props;

    addonStore.setAddonPanel("thread");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(false);
    addonStore.setAddonDetailPanel("Message Details", message);
  };

  markAsUnread = () => {
    const { message, messageStore } = this.props;

    messageStore.markAsUnread(message.id);
  };

  edit = () => {
    const { message, messageStore } = this.props;
    messageStore.startEdit(message.id, message);
  };

  delete = () => {
    const { message, messageStore, isReply } = this.props;
    let confirmMsg =
      "Are you sure you want to delete this message? This cannot be undone.";

    if (message.type === "upload") {
      confirmMsg = (
        <span>
          Are you sure you want to delete this message? This cannot be undone.
          <br />
          Note that deleting this message will not unshare the file.
        </span>
      );
    } else if (message.type === "file_comment") {
      confirmMsg = (
        <span>
          Are you sure you want to delete this message? This cannot be undone.
          <br />
          Note that deleting this message will not delete the comment.
        </span>
      );
    }

    confirmModal({
      title: "Delete Message",
      message: confirmMsg,
      okLabel: "Delete"
    }).then(() => {
      if (isReply) {
        messageStore.deleteMessageComment(message.id);
      } else {
        messageStore.delete(message.id);
      }
    });
  };

  render() {
    const {
      lastOtherUserMessage,
      message,
      user,
      isConversationMessage,
      isReply,
      parentMessageId
    } = this.props;
    const mine = user.id === currentUser.id;
    const unsent = message.status === "sending" || message.status === "failed";
    const { dropup, isEmojiPickerOpen, emojiPickerOffset } = this.state;
    const starredCX = message.starred ? "" : "-o";
    const notificationsEnabled = message.status !== "failed" && !isReply && message.notify_user_ids.includes(currentUser.id) ? true : false;
    const detailPageUrl = getFullUrl(`/archives-m${btoa(message.group_id)}-m${btoa(message.id)}-m${btoa(parentMessageId)}`);

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

        {!isConversationMessage && !isReply &&
          (
            <OverlayTrigger
              placement="top"
              delayShow={150}
              overlay={<Tooltip id="file-comments">Reply in Thread</Tooltip>}
            >
              <Button onClick={this.showMessageComments}>
                <i className="fa fa-comments" />
              </Button>
            </OverlayTrigger>
          )}

        {!isConversationMessage && !isReply &&
          message.type === "upload" && (
            <OverlayTrigger
              placement="top"
              delayShow={150}
              overlay={<Tooltip id="message-react">Share message</Tooltip>}
            >
              <Button onClick={this.shareMessage}>
                <i className="fa fa-share" />
              </Button>
            </OverlayTrigger>
          )}

        {!isConversationMessage && !isReply && (
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
        )}

        {!isConversationMessage && !isReply && (
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
        )}

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

            {!notificationsEnabled && (
              <MenuItem onClick={this.subscribeMessageNotifications}>Get notified about new replies</MenuItem>
            )}

            {notificationsEnabled && (
              <MenuItem onClick={this.unsubscribeMessageNotifications}>Turn off notifications for replies</MenuItem>
            )}

            {<MenuItem divider />}

            {(!mine ||
              (lastOtherUserMessage &&
                message.id < lastOtherUserMessage.id)) && (
                <MenuItem onClick={this.markAsUnread}>Mark as unread</MenuItem>
              )}


            {message.type !== "call" && (
              <CopyToClipboard
                text={detailPageUrl}
                onCopy={this.copy}
              >
                <MenuItem>
                  Copy Link
                </MenuItem>
              </CopyToClipboard>
            )}

            {mine &&
              message.type !== "upload" &&
              message.type !== "file_comment" && (
                <MenuItem onClick={this.edit}>Edit message</MenuItem>
              )}

            {(mine || isAdmin()) && (
              <MenuItem onClick={this.delete}>Delete message</MenuItem>
            )}
          </DropdownButton>
        </OverlayTrigger>
      </ButtonGroup>,

      <ReactionPicker
        key="reaction-picker"
        message={message}
        onSelectReaction={this.onSelectEmoji}
        show={isEmojiPickerOpen}
        pos={emojiPickerOffset}
      />
    ];
  }
}

MessageActions.propTypes = {
  setSelected: PropTypes.func.isRequired,
  message: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  messageStore: PropTypes.object.isRequired,
  isConversationMessage: PropTypes.bool,
  lastOtherUserMessage: PropTypes.object
};

MessageActions.defaultProps = {
  isConversationMessage: false,
  lastOtherUserMessage: null
};

export default MessageActions;
