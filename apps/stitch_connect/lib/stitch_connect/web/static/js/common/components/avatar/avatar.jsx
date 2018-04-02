import React, { Component } from "react";
import PropTypes from "prop-types";
import AvatarImage from "./avatar-image";

class Avatar extends Component {
  render() {
    const { user, size } = this.props;
    const wrapperClass = size === "sm" ? "avatar" : "";
    const avatarClass = size === "sm" ? "img-circle" : "img-responsive";

    return (
      <div className={wrapperClass}>
        <AvatarImage
          alt={user.username}
          className={avatarClass}
          src={user.avatar_thumb}
          user={user}
        />
      </div>
    );
  }
}

Avatar.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    avatar_thumb: PropTypes.string,
    username: PropTypes.string
  }),
  size: PropTypes.string
};

Avatar.defaultProps = {
  user: {
    avatar: "",
    avatar_thumb: "",
    username: ""
  },
  size: "sm"
};

export default Avatar;
