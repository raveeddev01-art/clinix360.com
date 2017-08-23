import React, { PropTypes } from "react";

import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { confirmable } from "react-confirm";

const Confirm = ({
  okLabel,
  cancelLabel,
  title,
  message,
  show,
  proceed,
  dismiss,
  cancel,
  enableEscape
}) =>
  <Modal
    show={show}
    onHide={dismiss}
    backdrop={enableEscape ? true : "static"}
    keyboard={enableEscape}
  >
    <Modal.Header>
      <Modal.Title>
        {title}
      </Modal.Title>
      <a role="button" onClick={dismiss}>
        <i className="fa fa-close" />
      </a>
    </Modal.Header>
    <Modal.Body>
      <h5>
        {message}
      </h5>
    </Modal.Body>
    <Modal.Footer>
      <Button bsSize="large" onClick={cancel}>
        {cancelLabel}
      </Button>
      <Button bsSize="large" bsStyle="primary" onClick={proceed}>
        {okLabel}
      </Button>
    </Modal.Footer>
  </Modal>;

Confirm.defaultProps = {
  okLabel: "OK",
  cancelLabel: "Cancel",
  title: "Confirm",
  message: "Are you sure?",
  show: false,
  enableEscape: true
};

Confirm.propTypes = {
  proceed: PropTypes.func, // called when ok button is clicked.
  cancel: PropTypes.func, // called when cancel button is clicked.
  dismiss: PropTypes.func, // called when backdrop is clicked or escaped.

  okLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  show: PropTypes.bool,
  enableEscape: PropTypes.bool
};

export default confirmable(Confirm);
