import React, { Component } from "react";
import PropTypes from "prop-types";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Modal from "react-bootstrap/lib/Modal";
import moment from "moment";

class MessageInfoModal extends Component {
  renderModalHeader() {
    const { closeModal } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>Message Info</Modal.Title>
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  renderItem(item) {
    return (
      <Row key={`read-status-${item.id}`} className="read-status-row">
        <Col xs={6} className="name">
          {item.id}
        </Col>
        <Col xs={3} className="date text-center">
          {moment
            .utc(item.timestamp)
            .local()
            .format("MM/DD/YY")}
        </Col>
        <Col xs={3} className="time text-right">
          {moment
            .utc(item.timestamp)
            .local()
            .format("hh:mm A")}
        </Col>
      </Row>
    );
  }

  renderModalBody() {
    const { message } = this.props;
    const notSeenRecipients = [];
    const seenRecipients = [];
    Object.keys(message.read_status).forEach(u => {
      if (message.read_status[u] == null) {
        notSeenRecipients.push({
          id: u,
          name: "John Doe",
          timestamp: message.inserted_at
        });
      } else {
        seenRecipients.push({
          id: u,
          name: "John Doe",
          timestamp: message.read_status[u]
        });
      }
    });

    return (
      <Modal.Body>
        <div>
          <h4>Seen By</h4>
          {seenRecipients.map(recipient => this.renderItem(recipient))}
        </div>
        <div>
          <h4 className="m-u-20">Delivered To</h4>
          {notSeenRecipients.map(recipient => this.renderItem(recipient))}
        </div>
      </Modal.Body>
    );
  }

  render() {
    const { show, closeModal } = this.props;

    return (
      <Modal className="message-info-modal" show={show} onHide={closeModal}>
        {this.renderModalHeader()}
        {this.renderModalBody()}
      </Modal>
    );
  }
}

MessageInfoModal.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default MessageInfoModal;
