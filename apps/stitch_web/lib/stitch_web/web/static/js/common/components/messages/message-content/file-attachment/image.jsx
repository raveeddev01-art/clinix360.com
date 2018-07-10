import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Modal from "react-bootstrap/lib/Modal";
import AttachmentActions from "./components/attachment-actions";

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
      url,
      size,
      comment_count: commentCount,
      onCommentsClick,
      onFileDownload,
      useActions,
      message,
      fileId,
      user_id,
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
        backgroundImage: `url(${previewUrl})`
      };
      holderStyle = {
        maxHeight: Math.min(height, 360) // constraint holder size for when paddingTop is bigger than height
      };
    }

    const blockCN = cx("attachment-image-block", {
      "attachment-image-block--sm": size === "sm"
    });

    return (
      <div className={blockCN}>
        {filename &&
          useActions && (
            <div className="attachment-title">
              <span>uploaded this image: </span>
              <a onClick={onCommentsClick}>
                <strong>{filename}</strong>
              </a>
            </div>
          )}
        <div className="attachment-image-holder" style={holderStyle}>
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
                    fileId={fileId}
                    user_id={user_id}
                    message={message}
                    commentCount={commentCount}
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

        <Modal
          show={showModal}
          dialogClassName="image-viewer"
          onHide={this.onToggleModal}
        >
          <Modal.Body onClick={this.onToggleModal}>
            <img
              src={url}
              className="modal-attachment-image img-responsive"
              alt={filename}
            />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

ImageFileAttachment.propTypes = {
  preview_height: PropTypes.number,
  preview_width: PropTypes.number,
  preview_url: PropTypes.string,
  filename: PropTypes.string,
  url: PropTypes.string.isRequired,
  comment_count: PropTypes.number,
  onCommentsClick: PropTypes.func,
  onFileDownload: PropTypes.func.isRequired,
  useActions: PropTypes.bool,
  size: PropTypes.string,
  fileId: PropTypes.number.isRequired,
  user_id: PropTypes.number.isRequired,
  message: PropTypes.object
};

ImageFileAttachment.defaultProps = {
  useActions: true,
  preview_height: 0,
  preview_width: 0,
  preview_url: "",
  filename: "",
  api_url: "",
  comment_count: 0,
  size: "md",
  onCommentsClick: () => undefined,
  message: null
};

export default ImageFileAttachment;
