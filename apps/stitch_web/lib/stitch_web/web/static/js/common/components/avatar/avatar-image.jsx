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
    const currentImg = this.userAvatar(this.props);
    const nextImg = this.userAvatar(nextProps);

    if (currentImg !== nextImg) {
      this.setState({ useFallback: false });
    }
  }

  onImageError = () => {
    const { user: { id }, usersStore } = this.props;

    // don't rerequest if we're already using the fallback
    if (!this.state.useFallback) {
      if (id) {
        // get a newly-signed URL (assuming it has expired)
        usersStore.loadAvatar(id);
      }

      this.setState({ useFallback: true });
    }
  };

  get fallbackAvatar() {
    return this.isCurrentUser ? fallbackBlueAvatar : fallbackGreyAvatar;
  }

  get imageClass() {
    const { className, user } = this.props;

    return cx(className, {
      "bordered-grey":
        !this.isCurrentUser && (user.grey_avatar || this.useFallback)
    });
  }

  get isCurrentUser() {
    return this.props.user.id === currentUser.id;
  }

  get useFallback() {
    return !this.userAvatar(this.props);
  }

  userAvatar(props) {
    const { useThumb, user } = props;
    if (!this.isCurrentUser && user.grey_avatar) {
      return user.grey_avatar;
    }

    return useThumb ? user.avatar_thumb : user.avatar;
  }

  render() {
    const { user: { username } } = this.props;
    const userAvatar = this.userAvatar(this.props);
    const avatarUrl = this.useFallback ? this.fallbackAvatar : userAvatar;

    return (
      <img
        style={{maxHeight:'250px', minHeight:'200px', overflow:'hidden'}}
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
