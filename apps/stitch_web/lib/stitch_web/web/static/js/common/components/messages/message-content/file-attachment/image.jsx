import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import AttachmentActions from "./components/attachment-actions";

@inject("desktopStore")
class ImageFileAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  onFileDownload = () => {
    const { desktopStore, api_url, filename } = this.props;
    desktopStore.sendDownloadRequest(api_url, filename);
  };

  onToggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  render() {
    const {
      filename,
      url,
      comment_count: commentCount,
      onCommentsClick,
      useActions,
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

    return (
      <div className="attachment-image-block">
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
              {useActions && (
                <AttachmentActions
                  url={url}
                  commentCount={commentCount}
                  onCommentsClick={onCommentsClick}
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
  api_url: PropTypes.string,
  comment_count: PropTypes.number,
  onCommentsClick: PropTypes.func,
  useActions: PropTypes.bool
};

ImageFileAttachment.defaultProps = {
  useActions: true,
  preview_height: 0,
  preview_width: 0,
  preview_url: "",
  filename: "",
  api_url: "",
  comment_count: 0,
  onCommentsClick: () => undefined
};

export default ImageFileAttachment;
