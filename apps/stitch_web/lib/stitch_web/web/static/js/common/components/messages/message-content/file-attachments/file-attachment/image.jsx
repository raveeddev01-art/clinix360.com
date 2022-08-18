import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
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
    this.setState({ showModal: !this.state.showModal });
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
      preview_url,
      mediaBlockClass
    } = this.props;
    const { showModal } = this.state;
    const thumbnail_src = preview_url ? preview_url : "/images/default-file-thumb.jpeg";
    const blockCN = cx("attachment-image-block", {
      "attachment-image-block--sm": size === "sm"
    });
    const holderCN = "attachment-image-holder attachment-block--view";

    return (
      <div className={blockCN}>
        <div className={holderCN}>
          <div className="attachment-description">
            <div
              className="attachment-thumb"
              onClick={this.onToggleModal}
            >
              <img src={thumbnail_src} className={mediaBlockClass} />
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
          type="Image"
          show={showModal}
          onHideModal={this.onToggleModal}
        />
      </div>
    );
  }
}

ImageFileAttachment.propTypes = {
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
