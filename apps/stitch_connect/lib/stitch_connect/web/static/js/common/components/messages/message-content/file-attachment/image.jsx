import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Button from "react-bootstrap/lib/Button";
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
    let holderStyle = null;

    if (height && width) {
      holderStyle = {
        maxHeight: 360 // Set to 360px to avoid having tall images take too much viewport space
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
        <div className="attachment-image-holder" style={holderStyle}>
          <img
            src={previewUrl || url}
            className="img-responsive"
            alt={filename}
            onClick={this.onToggleModal}
          />

          <div className="attachment-actions">
            <OverlayTrigger
              placement="top"
              delayShow={150}
              overlay={<Tooltip id="download-file">Download</Tooltip>}
            >
              <Button target="_blank" href={url} onClick={this.onFileDownload}>
                <i className="fa fa-download" />
              </Button>
            </OverlayTrigger>
          </div>
        </div>

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
  api_url: PropTypes.string
};

ImageFileAttachment.defaultProps = {
  preview_height: 0,
  preview_width: 0,
  preview_url: "",
  filename: "",
  api_url: ""
};

export default ImageFileAttachment;
