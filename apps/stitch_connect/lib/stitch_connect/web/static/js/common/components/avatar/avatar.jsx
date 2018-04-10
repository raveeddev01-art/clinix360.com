import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import AvatarImage from "./avatar-image";

class Avatar extends Component {
  render() {
    const { user, size } = this.props;
    const wrapperClass = size === "sm" ? "avatar" : "";
    const avatarClass = cx({
      "img-circle": size === "sm",
      "img-responsive": size !== "sm",
      "bordered-grey": user.grey_avatar && user.id !== currentUser.id
    });
    let avatarThumb = user.avatar_thumb;

    if (user.grey_avatar && user.id !== currentUser.id) {
      avatarThumb = user.grey_avatar;
    }

    return (
      <div className={wrapperClass}>
        <AvatarImage
          alt={user.username}
          className={avatarClass}
          src={avatarThumb}
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
