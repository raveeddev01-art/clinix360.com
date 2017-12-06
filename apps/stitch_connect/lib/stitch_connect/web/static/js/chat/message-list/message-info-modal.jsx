import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import moment from "moment";
import sortBy from "lodash/sortBy";

@inject("usersStore")
@observer
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
      <tr key={`read-status-${item.id}`}>
        <td className="sent-to">{item.name}</td>
        <td className="read-at">
          {item.timestamp
            ? moment
                .utc(item.timestamp)
                .local()
                .format("MMMM Do, YYYY [at] h:mm A")
            : "Unread"}
        </td>
      </tr>
    );
  }

  renderModalBody() {
    const { message, usersStore } = this.props;
    const recipients = [];
    if (!message.read_status) return null;

    Object.keys(message.read_status).forEach(u => {
      const user = usersStore.usersById[u];
      recipients.push({
        id: u,
        name: `${user.first_name} ${user.last_name}`,
        timestamp: message.read_status[u]
      });
    });

    return (
      <Modal.Body>
        <div>
          <h4>
            Sent:{" "}
            <em>
              {moment
                .utc(message.inserted_at)
                .local()
                .format("MMMM Do, YYYY [at] h:mm A")}
            </em>
          </h4>

          <table className="table-read-status table-striped">
            <thead>
              <tr>
                <th className="sent-to">Sent to:</th>
                <th className="read-at">Read at:</th>
              </tr>
            </thead>
            <tbody>
              {sortBy(recipients, "name").map(recipient =>
                this.renderItem(recipient)
              )}
            </tbody>
          </table>
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
