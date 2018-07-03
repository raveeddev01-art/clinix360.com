import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import AttachmentActions from "./components/attachment-actions";
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
    const {
      filename,
      mimetype,
      size_in_bytes: size,
      url,
      comment_count: commentCount,
      onCommentsClick,
      useActions
    } = this.props;
    const filetype = getFileType(mimetype);

    return (
      <div>
        {useActions && <span className="text-muted">uploaded this file: </span>}
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

          {useActions && (
            <AttachmentActions
              url={url}
              commentCount={commentCount}
              onCommentsClick={onCommentsClick}
            />
          )}
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
  api_url: PropTypes.string.isRequired,
  comment_count: PropTypes.number,
  onCommentsClick: PropTypes.func,
  useActions: PropTypes.bool
};

DefaultFileAttachment.defaultProps = {
  useActions: true,
  comment_count: 0,
  onCommentsClick: () => undefined
};

export default DefaultFileAttachment;
