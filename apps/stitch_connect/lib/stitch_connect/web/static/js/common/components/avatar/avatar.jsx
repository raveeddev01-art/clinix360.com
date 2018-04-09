import React, { Component } from "react";
import PropTypes from "prop-types";
import AvatarImage from "./avatar-image";
import { getGroupUserIdsThatHasCurrentUser } from "../../../lib/utils";

class Avatar extends Component {
  render() {
    const { user, size } = this.props;
    const wrapperClass = size === "sm" ? "avatar" : "";
    const avatarClass = size === "sm" ? "img-circle" : "img-responsive";
    let avatarThumb = user.avatar_thumb;

    if (user.grey_avatar && user.id !== currentUser.id) {
      console.log("Settin grey avatar");
      console.log(user.grey_avatar);
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
