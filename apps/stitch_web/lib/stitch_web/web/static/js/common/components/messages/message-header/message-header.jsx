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
    const { timestamp, user, children, disabledMenu, asPatient } = this.props;

    return (
      <div className="message-header">
        {!asPatient && (
          <UserProfileMenu
            user={user}
            className="name"
            disabledMenu={disabledMenu}
          >
            {user && this._renderName(user)}
          </UserProfileMenu>
        )}
        {asPatient && user && this._renderName(user)}
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
  asPatient: PropTypes.bool,
  disabledMenu: PropTypes.bool
};

MessageHeader.defaultProps = {
  children: null,
  asPatient: false,
  disabledMenu: false
};

export default MessageHeader;
