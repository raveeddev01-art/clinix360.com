import React, { Component } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";

class VideoModal extends Component {
  render() {
    const { state, closeModal } = this.props;

    return (
      <Modal show={!!state} onHide={closeModal} className="video-modal">
        <Modal.Body>
          <ResponsiveEmbed a16by9>
            <embed
              src="https://www.youtube.com/embed/lDnzr-OrYWU?rel=0&amp;autoplay=1&amp;showinfo=0"
              allowFullScreen
            />
          </ResponsiveEmbed>
        </Modal.Body>
      </Modal>
    );
  }
}

VideoModal.propTypes = {
  state: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default VideoModal;
