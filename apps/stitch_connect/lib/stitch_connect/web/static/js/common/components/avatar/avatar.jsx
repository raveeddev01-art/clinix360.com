import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

@inject("usersStore")
class Avatar extends Component {
  onError = () => {
    const { user, usersStore } = this.props;

    if (user.id) {
      usersStore.loadAvatar(user.id);
    }
  };

  render() {
    const { user, size } = this.props;

    if (size === "sm") {
      return (
        <div className="avatar">
          <img
            src={user.avatar_thumb}
            alt={user.username}
            onError={this.onError}
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
