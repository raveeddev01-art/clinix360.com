import React, { Component } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";

class VideoModal extends Component {
  render() {
    const { state, closeModal, connectVideo } = this.props;

    let videoSrc;

    if (connectVideo) {
      videoSrc =
        "https://www.youtube.com/embed/lDnzr-OrYWU?rel=0&amp;autoplay=1&amp;showinfo=0";
    } else {
      videoSrc =
        "https://www.youtube.com/embed/v1fjEFYMiyA?rel=0&amp;autoplay=1&amp;showinfo=0";
    }

    return (
      <Modal show={!!state} onHide={closeModal} className="video-modal">
        <Modal.Body>
          <ResponsiveEmbed a16by9>
            <embed src={videoSrc} allowFullScreen />
          </ResponsiveEmbed>
        </Modal.Body>
      </Modal>
    );
  }
}

VideoModal.defaultProps = {
  connectVideo: false
};

VideoModal.propTypes = {
  state: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  connectVideo: PropTypes.bool
};

export default VideoModal;
