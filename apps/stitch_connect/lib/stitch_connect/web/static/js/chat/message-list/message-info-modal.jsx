import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { MessageContent } from "common/components";
import cx from "classnames";
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
    lastWeek: "[last] dddd",
    nextWeek: "dddd",
    sameElse: "L"
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

  renderMessageText(textContent) {
    const newline = "\n";
    const lines = (textContent || "").split(newline);

    return lines.reduce(
      (result, line, i) =>
        result.concat(this.renderMessageLine(line), <br key={`br_${i}`} />),
      []
    );
  }

  renderModalBody() {
    const { message, usersStore } = this.props;
    const readRecipients = [];
    const unreadRecipients = [];
    const { user: sender } = message;
    const mine = message.user.id === currentUser.id;
    if (!message.read_status) return null;

    Object.keys(message.read_status).forEach(u => {
      const user = usersStore.usersById[u];
      if (message.read_status[u]) {
        readRecipients.push({
          id: u,
          name: `${user.first_name} ${user.last_name}`,
          timestamp: message.read_status[u]
        });
      } else {
        unreadRecipients.push({
          id: u,
          name: `${user.first_name} ${user.last_name}`,
          timestamp: message.inserted_at
        });
      }
    });

    return (
      <Modal.Body>
        <div>
          <div className="preview-wrapper">
            <div className={cx("message-preview", { mine })}>
              <MessageContent message={message} />
            </div>
          </div>
          <h4>Sent By</h4>
          <table className="table-read-status table-striped">
            <tbody>
              {this.renderItem({
                id: 1,
                name: `${sender.first_name} ${sender.last_name}`,
                timestamp: message.inserted_at
              })}
            </tbody>
          </table>
          <p />

          {!!readRecipients.length && (
            <div>
              <h4>Seen By</h4>
              <table className="table-read-status table-striped">
                <tbody>
                  {sortBy(readRecipients, "name").map(recipient =>
                    this.renderItem(recipient)
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!!unreadRecipients.length && (
            <div>
              <h4>Delivered To</h4>
              <table className="table-read-status table-striped">
                <tbody>
                  {sortBy(unreadRecipients, "name").map(recipient =>
                    this.renderItem(recipient)
                  )}
                </tbody>
              </table>
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
