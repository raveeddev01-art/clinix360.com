import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { FILE_VIEW_SIZE_LIMIT } from "lib/constants";
import getFileType from "lib/file-types";
import { getFullUrl, prettyFileSize } from "lib/utils";
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
      mimetype,
      url,
      size,
      size_in_bytes,
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
      preview_height,
      preview_width,
      preview_url
    } = this.props;
    const { showModal } = this.state;

    let placeholderStyle = {
      backgroundImage: `url(${preview_url})`
    };

    const filetype = getFileType(mimetype);
    let hoverText = "- Click to view";
    let hoverIcon = "search";
    let mainCN = "attachment-block attachment-block--view";
    
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

        <div className={mainCN}>
          <div className="attachment-icon">
            <i className={filetype.icon} />
            <i className={`fa attachment-icon__hover fa-${hoverIcon}`} />
          </div>
          <div className="attachment-description">
            <div className="attachment-title">
              <strong>{filename}</strong>
            </div>
            <div className="attachment-detail">
              {prettyFileSize(size_in_bytes)}&nbsp;
              <span className="attachment-detail__normal">
                {filetype.title}
              </span>
              <span className="attachment-detail__hover">{hoverText}</span>
            </div>

            <div
              className="attachment-thumb"
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

          </div>

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
