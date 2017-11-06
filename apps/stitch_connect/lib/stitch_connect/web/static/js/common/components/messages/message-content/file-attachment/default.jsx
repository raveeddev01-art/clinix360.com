import React, { Component } from "react";
import PropTypes from "prop-types";
import getFileType from "../file-types";

class DefaultFileAttachment extends Component {
  getFileSize = size => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)}KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / 1024 / 1024).toFixed(1)}MB`;
    }
    return `${(size / 1024 / 1024 / 1024).toFixed(1)}GB`;
  };

  render() {
    const { filename, mimetype, size_in_bytes: size, url } = this.props;
    const filetype = getFileType(mimetype);

    return (
      <div className="attachment-block">
        <div className="attachment-icon">
          <i className={filetype.icon} />
        </div>
        <div className="attachment-description">
          <div className="attachment-title">
            <a target="_blank" href={url}>
              {filename}
            </a>
          </div>
          <div className="attachment-detail">
            {filetype.title}
            <i className="file-data-separator fa fa-circle" />
            {this.getFileSize(size)}
          </div>
        </div>
      </div>
    );
  }
}

DefaultFileAttachment.propTypes = {
  filename: PropTypes.string.isRequired,
  mimetype: PropTypes.string,
  size_in_bytes: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired
};

export default DefaultFileAttachment;
