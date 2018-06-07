import React, { Component } from "react";
import PropTypes from "prop-types";
import { TimestampTooltip, UserProfileMenu } from "common/components";

class MessageHeader extends Component {
  _renderName = user => {
    if (user.is_bot) {
      return user.username;
    }

    return user.full_name;
  };

  render() {
    const { timestamp, user, children } = this.props;

    return (
      <div className="message-header">
        <UserProfileMenu user={user} className="name">
          {user && this._renderName(user)}
        </UserProfileMenu>
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
  ])
};

MessageHeader.defaultProps = {
  children: null
};

export default MessageHeader;
