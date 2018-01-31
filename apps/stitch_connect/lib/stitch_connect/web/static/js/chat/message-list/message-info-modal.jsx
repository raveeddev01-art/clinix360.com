import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { Avatar, MessageContent, MessageHeader } from "common/components";
import Modal from "react-bootstrap/lib/Modal";
import moment from "moment";
import sortBy from "lodash/sortBy";

@inject("usersStore")
@observer
class MessageInfoModal extends Component {
  dayLocale = {
    lastDay: "[Yesterday]",
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    lastWeek: "l",
    nextWeek: "l",
    sameElse: "l"
  };

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
        <td className="read-date">
          {moment
            .utc(item.timestamp)
            .local()
            .calendar(null, this.dayLocale)}
        </td>
        <td className="read-time">
          {moment
            .utc(item.timestamp)
            .local()
            .format("hh:mm A")}
        </td>
      </tr>
    );
  }

  renderMessagePreview() {
    const { message, usersStore } = this.props;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

    return (
      <div className="message-container addon">
        <div className="message">
          <Avatar user={user} />

          <div className="message-content">
            <MessageHeader timestamp={message.inserted_at} user={user} />
            <MessageContent message={message} />
          </div>
        </div>
      </div>
    );
  }

  renderRecipientsTable(recipients) {
    return (
      <table className="table-read-status table-striped">
        <tbody>
          {sortBy(recipients, "name").map(recipient =>
            this.renderItem(recipient)
          )}
        </tbody>
      </table>
    );
  }

  renderModalBody() {
    const { message, usersStore } = this.props;
    const readRecipients = [];
    const unreadRecipients = [];
    if (!message.read_status) return null;

    Object.keys(message.read_status).forEach(u => {
      const user = usersStore.usersById[u];
      if (message.read_status[u]) {
        readRecipients.push({
          id: u,
          name: user.full_name,
          timestamp: message.read_status[u]
        });
      } else {
        unreadRecipients.push({
          id: u,
          name: user.full_name,
          timestamp: message.inserted_at
        });
      }
    });

    return (
      <Modal.Body>
        <div>
          {this.renderMessagePreview()}

          {!!readRecipients.length && (
            <div>
              <h4>Seen By</h4>
              {this.renderRecipientsTable(readRecipients)}
            </div>
          )}

          {!!unreadRecipients.length && (
            <div>
              <h4>Delivered To</h4>
              {this.renderRecipientsTable(unreadRecipients)}
            </div>
          )}
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
