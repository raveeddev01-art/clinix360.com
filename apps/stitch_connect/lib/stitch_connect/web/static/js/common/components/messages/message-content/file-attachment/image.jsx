import React, { Component } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/lib/Modal";

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
      preview_height: height,
      preview_width: width,
      preview_url: previewUrl
    } = this.props;
    const { showModal } = this.state;
    let placeholderStyle = null;
    let holderStyle = null;
    if (height) {
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
            <a target="_blank" href={url}>
              {filename}
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
  url: PropTypes.string.isRequired
};

export default ImageFileAttachment;
