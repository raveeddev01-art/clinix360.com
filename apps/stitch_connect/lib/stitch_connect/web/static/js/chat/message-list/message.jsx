import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
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

@inject("messageStore", "groupStore", "usersStore")
@observer
class Message extends Component {
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

  toggleSelected = isSelected => {
    this.setState({ isSelected });
  };

  renderGutter(message) {
    const { usersStore } = this.props;
    const { inserted_at: insertedAt } = message;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

    return (
      <div className="message-gutter">
        {(message.pinned || (message.pinned && message.starred)) && (
            <div className="icon-pin">
              <i className="fa fa-thumb-tack fa-rotate-45" />
            </div>
          )}
        {message.starred &&
          !message.pinned && (
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
    const { message, messageStore } = this.props;
    const { chatDiv, newMessageLineMessage, highlightId } = messageStore;

    const messageClassName = cx("message", {
      sequential: message.is_sequential,
      selected: this.state.selected,
      highlight: highlightId === message.id,
      pinned: message.pinned || message.starred,
      failed: message.status === "failed"
    });

    return (
      <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        {newMessageLineMessage &&
          newMessageLineMessage.id === message.id && (
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
                    toggleSelected={this.toggleSelected}
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
  message: PropTypes.object.isRequired
};

export default Message;
