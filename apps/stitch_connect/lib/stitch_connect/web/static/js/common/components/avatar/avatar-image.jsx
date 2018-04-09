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
      reloadsForCurrentSrc: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    // if the src is new (i.e. a newly signed url), restart the count
    if (this.props.src !== nextProps.src) {
      this.setState({
        reloadsForCurrentSrc: 0
      });
    }
  }

  onImageError = () => {
    const { user, usersStore } = this.props;

    // don't rerequest if we have the thumb but its a bad url
    // or we've tried too many times
    if (!this.hasHitReloadMax) {
      // get a newly-signed URL (assuming it has expired)
      usersStore.loadAvatar(user.id);
      const newAttemptCount = this.state.reloadsForCurrentSrc + 1;
      this.setState({ reloadsForCurrentSrc: newAttemptCount });
    }
  };

  get hasHitReloadMax() {
    return this.state.reloadsForCurrentSrc >= imageReloadMaximum;
  }

  render() {
    const { src, alt, className } = this.props;
    const avatarUrl = this.hasHitReloadMax ? fallbackUserAvatar : src;

    return (
      <img
        // key forces the DOM to try to reload the image
        // even if the url coming in is the same
        key={this.state.reloadsForCurrentSrc}
        alt={alt}
        className={className}
        onError={this.onImageError}
        onLoad={this.onImageLoad}
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
