import React, { Component } from "react";
import PropTypes from "prop-types";
import getFileType from "lib/file-types";
import { prettyFileSize } from "lib/utils";
import AttachmentActions from "./components/attachment-actions";

class DefaultFileAttachment extends Component {
  render() {
    const {
      filename,
      mimetype,
      size_in_bytes: size,
      url,
      file_id,
      user_id,
      encoded_id,
      public_url,
      comment_count: commentCount,
      isConversationMessage,
      onCommentsClick,
      onFileDownload,
      useActions,
      message,
      children
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
              {onCommentsClick ? (
                <a onClick={onCommentsClick}>
                  <strong>{filename}</strong>
                </a>
              ) : (
                <strong>{filename}</strong>
              )}
            </div>
            <div className="attachment-detail">
              {prettyFileSize(size)} {filetype.title}
            </div>
            {children}
          </div>

          {useActions &&
            message && (
              <AttachmentActions
                url={url}
                file_id={file_id}
                user_id={user_id}
                encoded_id={encoded_id}
                public_url={public_url}
                message={message}
                commentCount={commentCount}
                isActionsVisible={isConversationMessage ? false : undefined}
                isOriginalOpenVisible={
                  isConversationMessage ? false : undefined
                }
                onCommentsClick={onCommentsClick}
                onFileDownload={onFileDownload}
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
  comment_count: PropTypes.number,
  onCommentsClick: PropTypes.func,
  isConversationMessage: PropTypes.bool.isRequired,
  onFileDownload: PropTypes.func.isRequired,
  useActions: PropTypes.bool,
  user_id: PropTypes.number.isRequired,
  encoded_id: PropTypes.string,
  public_url: PropTypes.string,
  file_id: PropTypes.number.isRequired,
  message: PropTypes.object,
  children: PropTypes.node
};

DefaultFileAttachment.defaultProps = {
  encoded_id: "",
  public_url: "",
  useActions: true,
  message: null,
  comment_count: 0,
  isConversationMessage: false,
  onCommentsClick: undefined,
  children: null
};

export default DefaultFileAttachment;
