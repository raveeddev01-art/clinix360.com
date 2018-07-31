import React, { Component } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { confirmable } from "react-confirm";
import noop from "lodash/noop";

class CallingModal extends Component {
  componentDidMount() {
    this.ringing = new Audio("/audios/calling.mp3");
    this.props.setDisimssReference(this.props.dismiss);
    this.timeout = setTimeout(this.props.cancel, 30 * 1000);
    this.playIncomingCall = this.playIncomingCall.bind(this);
    this.ringing.addEventListener("ended", this.playIncomingCall);
    this.ringing.play();
  }

  componentWillUnmount() {
    this.ringing.pause();
    clearTimeout(this.timeout);
    this.ringing.removeEventListener("ended", this.playIncomingCall);
  }

  playIncomingCall() {
    this.ringing.currentTime = 0;
    this.ringing.play();
  }

  render() {
    const { user, proceed, dismiss, cancel } = this.props;
    return (
      <Modal
        show
        onHide={dismiss}
        backdrop="static"
        keyboard={false}
        bsSize="small"
        className="call-modal"
      >
        <Modal.Header>
          <Modal.Title>Incoming Voice Call...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="avatar">
            <img alt={user.username} className="img-circle" src={user.avatar} />
          </div>

          <b className="caller-name">{user.full_name}</b>
          <span className="call-type">Voice Call</span>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="danger" onClick={cancel}>
            <i className="fa fa-phone fa-rotate-135" />
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={proceed}>
            <i className="fa fa-phone" />
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

CallingModal.defaultProps = {
  user: {},
  proceed: noop,
  cancel: noop,
  dismiss: noop,
  setDisimssReference: noop
};

CallingModal.propTypes = {
  user: PropTypes.object.isRequired,
  proceed: PropTypes.func, // called when ok button is clicked.
  cancel: PropTypes.func, // called when cancel button is clicked.
  dismiss: PropTypes.func, // called when backdrop is clicked or escaped.
  setDisimssReference: PropTypes.func
};

export default confirmable(CallingModal);
