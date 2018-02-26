import React, { Component } from "react";
import PropTypes from "prop-types";

class Avatar extends Component {
  render() {
    const { user, size, sidemenuAvatar } = this.props;

    if (sidemenuAvatar) {
      return (
        <div className="avatar">
          <img
            src={user.avatarThumb}
            alt={user.username}
            className="img-circle"
          />
        </div>
      );
    }

    if (size === "sm") {
      return (
        <div className="avatar">
          <img
            src={user.avatar_thumb}
            alt={user.username}
            className="img-circle"
          />
        </div>
      );
    }

    return (
      <img src={user.avatar} alt={user.username} className="img-responsive" />
    );
  }
}

Avatar.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    avatar_thumb: PropTypes.string,
    username: PropTypes.string
  }),
  size: PropTypes.string,
  sidemenuAvatar: PropTypes.bool
};

Avatar.defaultProps = {
  user: {
    avatar: "",
    avatar_thumb: "",
    username: ""
  },
  size: "sm",
  sidemenuAvatar: false
};

export default Avatar;
