import React, { Component, PropTypes } from "react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

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
        <Modal show={showModal} bsSize="large">
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
