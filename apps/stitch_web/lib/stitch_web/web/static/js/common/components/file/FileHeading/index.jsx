import React, { Component } from "react";
import PropTypes from "prop-types";
import { Avatar } from "common/components";

class FileHeading extends Component {
  render() {
    const user = this.props.user;
    const file = this.props.file;

    if (!user) {
      return null;
    }

    return (
      <div className="file-heading">
        <Avatar user={user} />
        <div className="file-heading__content">
          <div className="file-heading__content-user">{user.full_name}</div>
          <div className="file-heading__content-file">{file.filename}</div>
        </div>
      </div>
    );
  }
}

FileHeading.propTypes = {
  user: PropTypes.object,
  file: PropTypes.object.isRequired
};

FileHeading.defaultProps = {
  user: null
};

export default FileHeading;
