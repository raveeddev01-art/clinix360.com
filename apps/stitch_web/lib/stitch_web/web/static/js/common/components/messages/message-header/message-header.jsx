import React, { Component } from "react";
import PropTypes from "prop-types";
import { TimestampTooltip, UserProfileMenu } from "common/components";
import UserStatus from "../../user-status";

class MessageHeader extends Component {
  _renderName = user => {
    if (user.is_bot) {
      return user.username;
    }

    return user.full_name;
  };

  render() {
    const {
      timestamp,
      user,
      children,
      disabledMenu,
      isConversationMessage
    } = this.props;
    return (
      <div className="message-header">
        {isConversationMessage ? (
          <span className="name">{user.full_name}</span>
        ) : (
          <UserProfileMenu
            user={user}
            className="name"
            disabledMenu={disabledMenu}
          >
            {this._renderName(user)}
          </UserProfileMenu>
        )}
        <UserStatus user={user} type={"icon"} />
        <TimestampTooltip timestamp={timestamp} className="time" />
        {children}
      </div>
    );
  }
}

MessageHeader.propTypes = {
  timestamp: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  disabledMenu: PropTypes.bool,
  isConversationMessage: PropTypes.bool
};

MessageHeader.defaultProps = {
  children: null,
  disabledMenu: false,
  isConversationMessage: false
};

export default MessageHeader;
