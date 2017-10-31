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
    const { filename, url } = this.props;
    const { showModal } = this.state;
    return (
      <div className="attachment-image-block">
        <div className="attachment-title">
          <a target="_blank" href={url}>
            {filename}
          </a>
        </div>
        <a
          className="attachment-image"
          onClick={this.onToggleModal}
          role="link"
        >
          <img src={url} className="img-responsive" alt={filename} />
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
  filename: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
};

export default ImageFileAttachment;
