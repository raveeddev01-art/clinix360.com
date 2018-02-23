import React, { Component } from "react";
import PropTypes from "prop-types";
import { TimestampTooltip } from "common/components";

class MessageHeader extends Component {
  render() {
    const { timestamp, user, children } = this.props;

    return (
      <div className="message-header">
        <div className="name">{user.full_name}</div>
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
