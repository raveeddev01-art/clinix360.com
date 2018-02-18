import React from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { confirmable } from "react-confirm";
import noop from "lodash/noop";

const ConfirmModal = ({
  okLabel,
  cancelLabel,
  title,
  message,
  show,
  proceed,
  dismiss,
  cancel,
  enableEscape
}) => (
  <Modal
    show={show}
    onHide={dismiss}
    backdrop={enableEscape ? true : "static"}
    keyboard={enableEscape}
    className="message-modal"
  >
    <Modal.Header>
      <Modal.Title>{title}</Modal.Title>
      <a role="button" onClick={dismiss}>
        <i className="fa fa-close" />
      </a>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button bsSize="large" onClick={cancel}>
        {cancelLabel}
      </Button>
      <Button bsSize="large" bsStyle="primary" onClick={proceed}>
        {okLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

ConfirmModal.defaultProps = {
  proceed: noop,
  cancel: noop,
  dismiss: noop,
  okLabel: "OK",
  cancelLabel: "Cancel",
  show: false,
  enableEscape: true
};

ConfirmModal.propTypes = {
  proceed: PropTypes.func, // called when ok button is clicked.
  cancel: PropTypes.func, // called when cancel button is clicked.
  dismiss: PropTypes.func, // called when backdrop is clicked or escaped.

  okLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
  show: PropTypes.bool,
  enableEscape: PropTypes.bool
};

export default confirmable(ConfirmModal);
