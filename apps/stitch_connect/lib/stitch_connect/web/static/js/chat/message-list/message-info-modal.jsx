import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import {
  Avatar,
  MessageContent,
  MessageHeader,
  UserProfileMenu
} from "common/components";
import Modal from "react-bootstrap/lib/Modal";
import moment from "moment";
import sortBy from "lodash/sortBy";

@inject("usersStore", "messageStore")
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

  closeModal = () => {
    this.props.messageStore.infoModalMessageId = null;
  };

  renderModalHeader() {
    return (
      <Modal.Header>
        <Modal.Title>Message Info</Modal.Title>
        <a role="link" onClick={this.closeModal}>
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
    const { messageStore, usersStore } = this.props;
    const message = messageStore.infoMessage;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

    return (
      <div className="message-container addon">
        <div className="message">
          <UserProfileMenu user={user}>
            <Avatar user={user} />
          </UserProfileMenu>

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
    const { messageStore, usersStore } = this.props;
    const message = messageStore.infoMessage;
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
    const { messageStore } = this.props;
    const show = !!messageStore.infoModalMessageId;

    if (!show) {
      return null;
    }

    return (
      <Modal className="message-info-modal" show onHide={this.closeModal}>
        {this.renderModalHeader()}
        {this.renderModalBody()}
      </Modal>
    );
  }
}
export default MessageInfoModal;
