import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { Element } from "react-scroll";
import cx from "classnames";

import ButtonGroup from "react-bootstrap/lib/ButtonGroup";
import Button from "react-bootstrap/lib/Button";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";
import VisibilitySensor from "react-visibility-sensor";
import { confirm } from "common/modals";
import {
  Avatar,
  MessageHeader,
  MessageContent,
  ReactionPicker,
  TimestampTooltip
} from "common/components";
import MessageInfoModal from "./message-info-modal";

// @TODO stab out renderSomething functions into seperate component (MessageActionGroup, MessagePin, MessageStar, ...)
// @TODO move message info modal to top level so that it is shared on all messages
@inject("messageStore", "groupStore", "usersStore")
@observer
class Message extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: false,
      dropup: false,
      showEmojiPicker: false,
      showInfoModal: false
    };
  }

  componentDidMount() {
    const { message, messageStore } = this.props;

    messageStore.onMessageMounted(message.id, this.messageDiv);
  }

  onVisibleChange = isVisible => {
    const { message, messageStore } = this.props;

    if (isVisible) {
      messageStore.onMessageShow(message.id);
    } else {
      messageStore.onMessageHide(message.id);
    }
  };

  onToggle = isOpen => {
    const { chatDiv } = this.props.messageStore;

    this.setState({ selected: isOpen });

    if (isOpen) {
      this.setState({
        dropup:
          chatDiv.scrollTop + chatDiv.offsetHeight / 2 <
          this.messageDiv.offsetTop
      });
    }
  };

  onSelectEmoji = emoji => {
    const { messageStore, message } = this.props;
    this.setState({ showEmojiPicker: false }, () => {
      if (emoji) {
        messageStore.toggleReaction(message.id, emoji.colons);
      }
    });
    this.setState({ selected: false });
  };

  getEmojiMartStyle = () => {
    const martStyles = {};
    if (!this.messageDiv) {
      return {};
    }

    const pos = this.messageDiv.getBoundingClientRect();
    if (pos.bottom < window.innerHeight / 2) {
      martStyles.top = "24px";
    } else {
      martStyles.bottom = "calc(100% + 14px)";
    }

    return martStyles;
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
    confirm({
      title: "Delete Message",
      message:
        "Are you sure you want to delete this message? This cannot be undone.",
      okLabel: "Delete"
    }).then(() => {
      const { message, messageStore } = this.props;

      messageStore.delete(message.id);
    });
  };

  copy = () => {
    // Callback to run when message is copied
  };

  togglePin = () => {
    const { message, messageStore } = this.props;

    messageStore.togglePin(message.id);
  };

  toggleStar = () => {
    const { message, messageStore } = this.props;

    messageStore.toggleStar(message.id);
  };

  toggleReaction = () => {
    this.setState({ showEmojiPicker: true, selected: true });
  };

  showInfoModal = () => {
    this.setState({
      showInfoModal: true
    });
  };

  closeModal = () => {
    this.setState({
      showInfoModal: false
    });
  };

  renderStar(message) {
    const starredCX = message.starred ? "" : "-o";
    return (
      <OverlayTrigger
        placement="top"
        delayShow={150}
        shouldUpdatePosition
        overlay={
          <Tooltip id="message-star">
            {message.starred ? "Unstar this message" : "Star this message"}
          </Tooltip>
        }
      >
        <span
          className={cx("message-icon", `icon-star${starredCX}`)}
          role="presentation"
          onClick={this.toggleStar}
        >
          <i className={cx("fa", `fa-star${starredCX}`)} />
        </span>
      </OverlayTrigger>
    );
  }

  renderActions(message) {
    const mine = message.user.id === currentUser.id;
    const unsent = message.sent === false;
    const { dropup } = this.state;
    const { messageStore } = this.props;

    // disabling context menu
    if (unsent) {
      return " ";
    }

    return (
      <ButtonGroup
        id={`message-actions-${message.id}`}
        className="message-actions"
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
            <Tooltip id="message-pin">
              {message.pinned ? "Un-pin" : "Pin"} message
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
            onToggle={this.onToggle}
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
      </ButtonGroup>
    );
  }

  renderGutter(message) {
    const { usersStore } = this.props;
    const { inserted_at: insertedAt } = message;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

    return (
      <div className="message-gutter">
        {message.pinned && (
          <div className="icon-pin">
            <i className="fa fa-thumb-tack fa-rotate-45" />
          </div>
        )}
        {message.status === "failed" && (
          <div className="icon-status">
            <i className="fa fa-exclamation-triangle" />
          </div>
        )}
        {!message.is_sequential && <Avatar user={user} />}
        {message.is_sequential && (
          <TimestampTooltip
            timestamp={insertedAt}
            className="timestamp text-muted"
            format="h:mm"
          />
        )}
        {message.is_sequential && this.renderStar(message)}
      </div>
    );
  }

  renderHeader(message) {
    const { usersStore } = this.props;
    const { inserted_at: insertedAt } = message;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

    return (
      !message.is_sequential && (
        <MessageHeader user={user} timestamp={insertedAt}>
          {this.renderStar(message)}
        </MessageHeader>
      )
    );
  }

  render() {
    const { message, messageStore } = this.props;
    const { chatDiv, newMessageLineMessage, highlightId } = messageStore;

    const messageClassName = cx("message", {
      sequential: message.is_sequential,
      selected: this.state.selected,
      highlight: highlightId === message.id,
      pinned: message.pinned,
      failed: message.status === "failed"
    });

    return (
      <div>
        {newMessageLineMessage &&
          newMessageLineMessage.id === message.id && (
            <Element name="newMessageBanner" className="new-message-banner">
              <div className="banner-text">New Messages</div>
            </Element>
          )}

        <div
          className="message-container"
          ref={div => {
            this.messageDiv = div;
          }}
        >
          <VisibilitySensor
            active
            onChange={this.onVisibleChange}
            partialVisibility="top"
            minTopValue={1}
            intervalCheck={false}
            scrollCheck
            scrollThrottle={100}
            containment={chatDiv}
          >
            <Element
              name={`message_${message.id}`}
              className={messageClassName}
            >
              {this.renderGutter(message)}

              <div className="message-content">
                {message.pinned && <div className="pin-label">Pinned</div>}
                {message.status === "failed" && (
                  <div className="message-status-label">
                    Failed to send message
                  </div>
                )}

                {this.renderHeader(message)}

                <ReactionPicker
                  message={message}
                  onSelectReaction={this.onSelectEmoji}
                  show={this.state.showEmojiPicker}
                  style={this.getEmojiMartStyle()}
                />

                <div className="message-content-wrapper">
                  <MessageContent message={message} />
                </div>
              </div>

              {this.renderActions(message)}

              <MessageInfoModal
                show={this.state.showInfoModal}
                message={message}
                closeModal={this.closeModal}
              />
            </Element>
          </VisibilitySensor>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  message: PropTypes.object.isRequired
};

export default Message;
