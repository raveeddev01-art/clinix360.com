import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { DEFAULT_AVATAR_PATH } from "lib/constants";

// Constants
const fallbackUserAvatar = `${window.publicBucket}/${DEFAULT_AVATAR_PATH}`;
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

  render() {
    const { src, alt, className } = this.props;
    const avatarUrl = this.state.useFallback ? fallbackUserAvatar : src;

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
