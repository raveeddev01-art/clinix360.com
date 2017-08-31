import React, { Component, PropTypes } from "react";
import FILE_TYPES from "./file-types";

class FileAttachment extends Component {
  getFileType = mimetype =>
    FILE_TYPES[mimetype] || {
      icon: "fa fa-file-o",
      type: "File"
    };

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
    const filetype = this.getFileType(mimetype);

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
            {filetype.type}
            <i className="file-data-separator fa fa-circle" />
            {this.getFileSize(size)}
          </div>
        </div>
      </div>
    );
  }
}

FileAttachment.propTypes = {
  filename: PropTypes.string.isRequired,
  mimetype: PropTypes.string,
  size_in_bytes: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired
};

export default FileAttachment;
