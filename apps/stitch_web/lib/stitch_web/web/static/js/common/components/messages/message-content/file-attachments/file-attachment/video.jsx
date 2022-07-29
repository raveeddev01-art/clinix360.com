import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { FILE_VIEW_SIZE_LIMIT } from "lib/constants";
import getFileType from "lib/file-types";
import { getFullUrl, prettyFileSize } from "lib/utils";
import AttachmentActions from "./components/attachment-actions";
import FileViewer from "./file-viewer";
class VideoFileAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  onToggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  isAllowedForPreview = () => {
    return this.props.size_in_bytes < FILE_VIEW_SIZE_LIMIT.VIDEO;
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
      mediaBlockClass
    } = this.props;


    let mainCN = "attachment-block--view";

    const blockCN = cx("attachment-image-block", {
      "attachment-image-block--sm": size === "sm"
    });

    return (
      <div className={blockCN}>
        <div className={mainCN}>
          <div className="attachment-description">
            <div
              className="attachment-thumb"
              onClick={this.onToggleModal}
            >
              <video
                className={mediaBlockClass}
                style={{maxWidth: "660px"}}
                controls
                src={this.props.url} 
              />
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

        <FileViewer
          {...this.props}
          type="Video File"
          show={this.state.showModal}
          onHideModal={this.onToggleModal}
        />
      </div>
    );
  }

}

VideoFileAttachment.propTypes = {
  preview_height: PropTypes.number,
  preview_width: PropTypes.number,
  preview_url: PropTypes.string,
  size_in_bytes: PropTypes.number,
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

VideoFileAttachment.defaultProps = {
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

export default VideoFileAttachment;
