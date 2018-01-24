import React, { Component } from "react";
import PropTypes from "prop-types";
import getFileType from "../file-types";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";

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
      <div>
        <span className="text-muted">uploaded this file: </span>
        <div className="attachment-block">
          <div className="attachment-icon">
            <i className={filetype.icon} />
          </div>
          <div className="attachment-description">
            <div className="attachment-title">
              <a target="_blank" href={url}>
                <strong>{filename}</strong>
              </a>
            </div>
            <div className="attachment-detail">
              {this.getFileSize(size)} {filetype.title}
            </div>
          </div>

          <div className="attachment-actions">
            <OverlayTrigger
              placement="top"
              delayShow={150}
              overlay={<Tooltip id="download-file">Download</Tooltip>}
            >
              <Button target="_blank" href={url}>
                <i className="fa fa-download" />
              </Button>
            </OverlayTrigger>
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
