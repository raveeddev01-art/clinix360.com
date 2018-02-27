import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/lib/Modal";

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
      preview_height: height,
      preview_width: width,
      preview_url: previewUrl
    } = this.props;
    const { showModal } = this.state;
    let placeholderStyle = null;
    let holderStyle = null;

    if (height && width) {
      placeholderStyle = {
        width,
        paddingTop: `${height / width * 100}%`,
        backgroundImage: `url(${previewUrl})`
      };
      holderStyle = {
        maxHeight: height // constraint holder size for when paddingTop is bigger than height
      };
    }

    return (
      <div className="attachment-image-block">
        {filename && (
          <div className="attachment-title">
            <span>uploaded this image: </span>
            <a target="_blank" href={url} onClick={this.onFileDownload}>
              <strong>{filename}</strong>
            </a>
          </div>
        )}
        <a
          className="attachment-image-holder"
          onClick={this.onToggleModal}
          style={holderStyle}
          role="link"
        >
          {placeholderStyle ? (
            <div
              className="attachment-preview-placeholder"
              style={placeholderStyle}
            />
          ) : (
            <img
              src={previewUrl || url}
              className="img-responsive"
              alt={filename}
            />
          )}
        </a>
        <Modal
          show={showModal}
          dialogClassName="image-viewer"
          onHide={this.onToggleModal}
        >
          <Modal.Body onClick={this.onToggleModal}>
            <img src={url} className="modal-attachment-image" alt={filename} />
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
  api_url: PropTypes.string.isRequired
};

ImageFileAttachment.defaultProps = {
  preview_height: 0,
  preview_width: 0,
  preview_url: "",
  filename: ""
};

export default ImageFileAttachment;
