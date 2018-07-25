import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { Element } from "react-scroll";
import cx from "classnames";
import VisibilitySensor from "react-visibility-sensor";
import {
  Avatar,
  MessageHeader,
  MessageContent,
  TimestampTooltip,
  UserProfileMenu
} from "common/components";
import MessageActions from "./message-actions";

@inject("usersStore")
class Message extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isActionsVisible: false,
      isSelected: false
    };
  }

  componentDidMount() {
    const { message, onMounted } = this.props;

    onMounted(message.id, this.messageDiv);
  }

  componentWillUnmount() {
    const { message, onUnmounted } = this.props;

    onUnmounted(message.id);
  }

  onVisibleChange = isVisible => {
    const { message, onShow, onHide } = this.props;

    if (isVisible) {
      onShow(message.id);
    } else {
      onHide(message.id);
    }
  };

  onMouseEnter = () => {
    this.setState({ isActionsVisible: true });
  };

  onMouseLeave = () => {
    this.setState({ isActionsVisible: false });
  };

  getUser = message => {
    const { usersStore } = this.props;
    if (window.currentPatient || message.patient_id) {
      return message.user;
    }

    const userId = message.user && message.user.id;
    return usersStore.usersById[userId];
  };

  setSelected = newState => {
    this.setState(newState);
  };

  renderGutter(message) {
    const { inserted_at: insertedAt } = message;
    const user = this.getUser(message);

    return (
      <div className="message-gutter">
        {message.pinned && (
          <div className="icon-pin">
            <i className="fa fa-thumb-tack fa-rotate-45" />
          </div>
        )}
        {!message.pinned &&
          message.starred && (
            <div className="icon-star">
              <i className="fa fa-star" />
            </div>
          )}
        {message.status === "failed" && (
          <div className="icon-status">
            <i className="fa fa-exclamation-triangle" />
          </div>
        )}
        {!message.is_sequential && (
          <UserProfileMenu user={user}>
            <Avatar user={user} />
          </UserProfileMenu>
        )}
        {message.is_sequential && (
          <TimestampTooltip
            timestamp={insertedAt}
            className="timestamp text-muted"
          />
        )}
      </div>
    );
  }

  renderHeader(message) {
    const { inserted_at: insertedAt } = message;
    const { asPatient } = this.props;
    const user = this.getUser(message);

    return (
      (!message.is_sequential || message.type === "file_comment") && (
        <MessageHeader
          user={user}
          timestamp={insertedAt}
          asPatient={asPatient}
        />
      )
    );
  }

  render() {
    const { isActionsVisible, isSelected } = this.state;
    const {
      message,
      hasNML,
      isHighlighted,
      chatDiv,
      messageStore,
      isConversationMessage,
      lastOtherUserMessage
    } = this.props;
    const user = this.getUser(message);

    const messageClassName = cx("message", {
      sequential: message.is_sequential,
      selected: isSelected,
      highlight: isHighlighted,
      pinned: message.pinned || message.starred,
      failed: message.status === "failed",
      bot_message: user && user.is_bot
    });

    return (
      <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        {hasNML && (
          <Element name="newMessageBanner" className="new-message-banner">
            <div className="blue-line">
              <div className="banner-text">New Messages</div>
            </div>
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
            intervalCheck
            intervalDelay={1000}
            delayedCall
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
                {message.starred &&
                  !message.pinned && <div className="pin-label">Starred</div>}
                {message.status === "failed" && (
                  <div className="message-status-label">
                    Failed to send message
                  </div>
                )}

                {this.renderHeader(message)}

                <div className="message-content-wrapper">
                  <MessageContent
                    messageStore={messageStore}
                    message={message}
                    user={user}
                  />
                </div>
              </div>

              {(isActionsVisible || isSelected) && (
                  <MessageActions
                    user={user}
                    message={message}
                    lastOtherUserMessage={lastOtherUserMessage}
                    messageStore={messageStore}
                    setSelected={this.setSelected}
                    isConversationMessage={isConversationMessage}
                  />
                )}
            </Element>
          </VisibilitySensor>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  hasNML: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  message: PropTypes.object.isRequired,
  onMounted: PropTypes.func,
  onUnmounted: PropTypes.func,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
  chatDiv: PropTypes.object,
  messageStore: PropTypes.object.isRequired,
  isConversationMessage: PropTypes.bool,
  lastOtherUserMessage: PropTypes.object,
  asPatient: PropTypes.bool
};

Message.defaultProps = {
  hasNML: false,
  isHighlighted: false,
  onMounted: () => undefined,
  onUnmounted: () => undefined,
  onShow: () => undefined,
  onHide: () => undefined,
  lastOtherUserMessage: null,
  isConversationMessage: false,
  chatDiv: null,
  asPatient: false
};

export default Message;
