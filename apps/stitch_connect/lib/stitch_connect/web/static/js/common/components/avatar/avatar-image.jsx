import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { DEFAULT_AVATAR_PATH } from "lib/constants";

// Constants
const fallbackUserAvatar = `${window.publicBucket}/${DEFAULT_AVATAR_PATH}`;
const imageReloadMaximum = 2;

@inject("usersStore")
class AvatarImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userFallback: false,
      reloadAttempts: 0
    };
  }

  onImageError = () => {
    const { src, user, usersStore } = this.props;

    // don't rerequest if we have the thumb but its a bad url
    // or we've tried too many times
    if (!src && !this.hasHitReloadMax) {
      usersStore.loadAvatar(user.id);
      const newAttemptCount = this.state.reloadAttempts + 1;
      this.setState({ reloadAttempts: newAttemptCount });
    } else {
      this.setState({ userFallback: true });
    }
  };

  get hasHitReloadMax() {
    return this.state.reloadAttempts >= imageReloadMaximum;
  }

  render() {
    const { src, alt, className } = this.props;
    const avatarUrl = this.state.userFallback ? fallbackUserAvatar : src;

    return (
      <img
        alt={alt}
        className={className}
        onError={this.onImageError}
        src={avatarUrl}
      />
    );
  }
}

AvatarImage.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string,
    avatar_thumb: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  src: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired
};

export default AvatarImage;
