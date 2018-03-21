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

@inject("messageStore", "usersStore")
class Message extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isActionsVisible: false,
      isSelected: false
    };
  }

  componentDidMount() {
    const { message, messageStore } = this.props;

    messageStore.onMessageMounted(message.id, this.messageDiv);
  }

  componentWillUnmount() {
    const { message, messageStore } = this.props;

    messageStore.onMessageUnmounted(message.id);
  }

  onVisibleChange = isVisible => {
    const { message, messageStore } = this.props;

    if (isVisible) {
      messageStore.onMessageShow(message.id);
    } else {
      messageStore.onMessageHide(message.id);
    }
  };

  onMouseEnter = () => {
    this.setState({ isActionsVisible: true });
  };

  onMouseLeave = () => {
    this.setState({ isActionsVisible: false });
  };

  setSelected = newState => {
    this.setState(newState);
  };

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
    const { usersStore } = this.props;
    const { inserted_at: insertedAt } = message;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

    return (
      !message.is_sequential && (
        <MessageHeader user={user} timestamp={insertedAt} />
      )
    );
  }

  render() {
    const { isActionsVisible, isSelected } = this.state;
    const { message, messageStore, hasNML, isHighlighted } = this.props;
    const { chatDiv } = messageStore;

    const messageClassName = cx("message", {
      sequential: message.is_sequential,
      selected: isSelected,
      highlight: isHighlighted,
      pinned: message.pinned || message.starred,
      failed: message.status === "failed"
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
                {message.starred &&
                  !message.pinned && <div className="pin-label">Starred</div>}
                {message.status === "failed" && (
                  <div className="message-status-label">
                    Failed to send message
                  </div>
                )}

                {this.renderHeader(message)}

                <div className="message-content-wrapper">
                  <MessageContent message={message} />
                </div>
              </div>

              {(isActionsVisible || isSelected) && (
                  <MessageActions
                    message={message}
                    setSelected={this.setSelected}
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
  message: PropTypes.object.isRequired
};

Message.defaultProps = {
  hasNML: false,
  isHighlighted: false
};

export default Message;
