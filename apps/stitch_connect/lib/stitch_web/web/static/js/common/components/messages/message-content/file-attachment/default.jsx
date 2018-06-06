import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";
import getFileType from "../file-types";

@inject("desktopStore")
class DefaultFileAttachment extends Component {
  onFileDownload = () => {
    const { desktopStore, api_url, filename } = this.props;
    desktopStore.sendDownloadRequest(api_url, filename);
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
              <a target="_blank" href={url} onClick={this.onFileDownload}>
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
              <Button target="_blank" href={url} onClick={this.onFileDownload}>
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
  mimetype: PropTypes.string.isRequired,
  size_in_bytes: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  api_url: PropTypes.string.isRequired
};

export default DefaultFileAttachment;
