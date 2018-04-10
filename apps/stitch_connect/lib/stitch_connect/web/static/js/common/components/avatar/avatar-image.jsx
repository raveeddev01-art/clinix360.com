import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import cx from "classnames";

import { DEFAULT_AVATAR_PATH, DEFAULT_GREY_AVATAR_PATH } from "lib/constants";

// Constants
const fallbackBlueAvatar = `${window.publicBucket}/${DEFAULT_AVATAR_PATH}`;
const fallbackGreyAvatar = `${window.publicBucket}/${DEFAULT_GREY_AVATAR_PATH}`;

@inject("usersStore")
class AvatarImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      useFallback: false
    };
  }

  componentWillReceiveProps(nextProps) {
    // if the src is new (i.e. a newly signed url),
    // don't use the fallback
    if (this.props.src !== nextProps.src) {
      this.setState({ useFallback: false });
    }
  }

  onImageError = () => {
    const { user, usersStore } = this.props;

    // don't rerequest if we're already using the fallback
    if (!this.state.useFallback) {
      // get a newly-signed URL (assuming it has expired)
      usersStore.loadAvatar(user.id);
      this.setState({ useFallback: true });
    }
  };

  get userAvatar() {
    const { useThumb, user } = this.props;
    if (!this.isCurrentUser) {
      return user.grey_avatar;
    }

    return useThumb ? user.avatar_thumb : user.avatar;
  }

  get fallbackAvatar() {
    return this.isCurrentUser ? fallbackBlueAvatar : fallbackGreyAvatar;
  }

  get imageClass() {
    const { className, user } = this.props;

    return cx(className, {
      "bordered-grey": user.grey_avatar && !this.isCurrentUser
    });
  }

  get isCurrentUser() {
    return this.props.user.id === currentUser.id;
  }

  render() {
    const { user: { username } } = this.props;
    const avatarUrl = this.state.useFallback
      ? this.fallbackAvatar
      : this.userAvatar;

    return (
      <img
        alt={username}
        className={this.imageClass}
        onError={this.onImageError}
        src={avatarUrl}
      />
    );
  }
}

AvatarImage.propTypes = {
  className: PropTypes.string.isRequired,
  user: PropTypes.shape({
    avatar_thumb: PropTypes.string,
    avatar: PropTypes.string,
    id: PropTypes.number,
    username: PropTypes.string
  }).isRequired,
  useThumb: PropTypes.bool.isRequired
};

export default AvatarImage;
