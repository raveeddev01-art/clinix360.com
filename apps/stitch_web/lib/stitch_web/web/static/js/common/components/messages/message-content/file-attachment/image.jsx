import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { FILE_VIEW_SIZE_LIMIT } from "lib/constants";
import { getFullUrl } from "lib/utils";
import AttachmentActions from "./components/attachment-actions";
import FileViewer from "./file-viewer";

class ImageFileAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  onToggleModal = () => {
    const { encoded_id, useActions } = this.props;
    if (this.isAllowedForPreview()) {
      this.setState({ showModal: !this.state.showModal });
    } else if (useActions) {
      const detailPageUrl =
        encoded_id && getFullUrl(`/admin/files/${encoded_id}`);
      window.open(detailPageUrl);
    }
  };

  isAllowedForPreview = () => {
    return this.props.size_in_bytes < FILE_VIEW_SIZE_LIMIT.IMAGE;
  };

  render() {
    const {
      filename,
      url,
      size,
      comment_count: commentCount,
      onCommentsClick,
      isConversationMessage,
      onFileDownload,
      useActions,
      message,
      file_id,
      encoded_id,
      user_id,
      public_url,
      preview_height: height,
      preview_width: width,
      preview_url: previewUrl
    } = this.props;
    const { showModal } = this.state;
    let holderStyle = null;
    let placeholderStyle = null;

    if (height && width) {
      let ratio = 1; // ratio between original size to rendered size. Rendered max width & height is restricted by 360px
      if (height > 360) {
        ratio = height / 360;
      }

      placeholderStyle = {
        width: width / ratio,
        paddingTop: `${height / width * 100}%`,
        backgroundImage: `url(${url})`
      };
      holderStyle = {
        maxHeight: Math.min(height, 360) // constraint holder size for when paddingTop is bigger than height
      };
    }

    const blockCN = cx("attachment-image-block", {
      "attachment-image-block--sm": size === "sm"
    });
    const holderCN = cx("attachment-image-holder", {
      "attachment-image-holder--zoom": this.isAllowedForPreview(),
      "attachment-image-holder--original":
        !this.isAllowedForPreview() && useActions
    });

    return (
      <div className={blockCN}>
        {filename &&
          useActions && (
            <div className="attachment-title">
              <span>uploaded this image: </span>
              {isConversationMessage ? (
                <a target="_blank" href={url} onClick={onFileDownload}>
                  <strong>{filename}</strong>
                </a>
              ) : (
                <a onClick={onCommentsClick}>
                  <strong>{filename}</strong>
                </a>
              )}
            </div>
          )}
        <div className={holderCN} style={holderStyle}>
          {placeholderStyle ? (
            <div
              className="attachment-preview-placeholder"
              style={placeholderStyle}
              onClick={this.onToggleModal}
            >
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
          ) : (
            <img
              src={previewUrl || url}
              className="img-responsive"
              alt={filename}
              onClick={this.onToggleModal}
            />
          )}
        </div>

        {this.isAllowedForPreview() && (
          <FileViewer
            {...this.props}
            type="Image"
            show={showModal}
            onHideModal={this.onToggleModal}
          />
        )}
      </div>
    );
  }
}

ImageFileAttachment.propTypes = {
  preview_height: PropTypes.number,
  preview_width: PropTypes.number,
  preview_url: PropTypes.string,
  size_in_bytes: PropTypes.number.isRequired,
  filename: PropTypes.string,
  url: PropTypes.string.isRequired,
  comment_count: PropTypes.number,
  onCommentsClick: PropTypes.func,
  isConversationMessage: PropTypes.bool.isRequired,
  onFileDownload: PropTypes.func.isRequired,
  useActions: PropTypes.bool,
  size: PropTypes.string,
  file_id: PropTypes.number.isRequired,
  encoded_id: PropTypes.string,
  public_url: PropTypes.string,
  user_id: PropTypes.number.isRequired,
  message: PropTypes.object
};

ImageFileAttachment.defaultProps = {
  useActions: true,
  preview_height: 0,
  preview_width: 0,
  preview_url: "",
  public_url: "",
  filename: "",
  encoded_id: "",
  comment_count: 0,
  size: "md",
  isConversationMessage: false,
  onCommentsClick: undefined,
  message: null
};

export default ImageFileAttachment;
