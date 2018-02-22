import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { UserProfileMenu } from "common/components";

export default class UserMention extends Component {
  render() {
    const { user: mentionedUser } = this.props;

    const mentionClassName = cx('user-mention', {
      me: mentionedUser.username === currentUser.username
    });

    return (
      <UserProfileMenu user={mentionedUser} className={mentionClassName}>
        {`@${mentionedUser.username}`}
      </UserProfileMenu>
    );
  }
}

UserMention.propTypes = {
  user: PropTypes.any.isRequired
};
