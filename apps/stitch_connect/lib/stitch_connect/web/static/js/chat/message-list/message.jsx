import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import moment from "moment";
import { Element } from "react-scroll";
import capitalize from "lodash/capitalize";
import cx from "classnames";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";
import VisibilitySensor from "react-visibility-sensor";

import { confirm } from "../../common/modals";
import MessageContent from "../../common/components/messages/message-content/message-content";

@inject("messageStore", "groupStore", "usersStore")
@observer
class Message extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: false, dropup: false };
  }

  componentDidMount() {
    const { message, messageStore } = this.props;

    messageStore.onMessageMounted(message.id, this.messageDiv);
  }

  onVisibleChange = isVisible => {
    const { message, messageStore } = this.props;

    if (isVisible) {
      messageStore.onMessageShow(message.id);
    } else {
      messageStore.onMessageHide(message.id);
    }
  };

  onToggle = isOpen => {
    const { chatDiv } = this.props.messageStore;

    this.setState({ selected: isOpen });

    if (isOpen) {
      this.setState({
        dropup:
          chatDiv.scrollTop + chatDiv.offsetHeight / 2 <
          this.messageDiv.offsetTop
      });
    }
  };

  markAsUnread = () => {
    const { message, messageStore } = this.props;

    messageStore.markAsUnread(message.id);
  };

  edit = () => {
    const { message, messageStore } = this.props;

    messageStore.startEdit(message.id);
  };

  delete = () => {
    confirm({
      title: "Delete Message",
      message:
        "Are you sure you want to delete this message? This cannot be undone.",
      okLabel: "Delete"
    }).then(() => {
      const { message, messageStore } = this.props;

      messageStore.delete(message.id);
    });
  };

  copy = () => {
    // Callback to run when message is copied
  };

  togglePin = () => {
    const { message, messageStore } = this.props;

    messageStore.togglePin(message.id);
  };

  toggleStar = () => {
    const { message, messageStore } = this.props;

    messageStore.toggleStar(message.id);
  };

  renderEdited(message) {
    const { edited, edited_at: editedAt } = message;

    if (!edited) {
      return null;
    }

    const editedTooltip = (
      <Tooltip id="edited-tooltip">{moment(editedAt).calendar()}</Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={editedTooltip}>
        <span className="message-icon icon-edited">
          <i className="fa fa-edit" />
        </span>
      </OverlayTrigger>
    );
  }

  renderStar(message) {
    const { starred } = message;

    if (!starred) {
      return null;
    }
    const starTooltip = (
      <Tooltip id="star-tooltip">Unstar this message</Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={starTooltip}>
        <span
          className="message-icon icon-star"
          role="presentation"
          onClick={this.toggleStar}
        >
          <i className="fa fa-star" />
        </span>
      </OverlayTrigger>
    );
  }

  renderPin(message) {
    if (
      !message.pinned ||
      !message.pinned_at ||
      !message.pinned_by ||
      !message.pinned_by.id
    ) {
      return null;
    }

    const { usersStore } = this.props;
    const { pinned_at: pinnedAt, pinned_by: { id: pinnedById } } = message;
    const pinnedBy = usersStore.usersById[pinnedById];
    const pinTooltip = (
      <Tooltip id="pin-tooltip">
        <span>
          Pinned by{" "}
          {pinnedBy.id === currentUser.id
            ? "You"
            : `${pinnedBy.first_name} ${pinnedBy.last_name}`}
        </span>
        <br />
        <span className="text-muted">
          {pinnedAt && moment(pinnedAt).calendar()}
        </span>
      </Tooltip>
    );

    return (
      <OverlayTrigger placement="top" overlay={pinTooltip}>
        <span
          className="message-icon icon-pin"
          role="presentation"
          onClick={this.togglePin}
        >
          <i className="fa fa-thumb-tack fa-rotate-45" />
        </span>
      </OverlayTrigger>
    );
  }

  renderActions(message) {
    const mine = message.user.id === currentUser.id;
    const unsent = message.sent === false;
    const { dropup } = this.state;

    // disabling context menu
    if (unsent) {
      return " ";
    }

    return (
      <Dropdown
        id={`message-actions-${message.id}`}
        componentClass="div"
        className="message-actions"
        dropup={dropup}
        pullRight
        onToggle={this.onToggle}
      >
        <Dropdown.Toggle useAnchor noCaret>
          <i className="fa fa-angle-down" />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <MenuItem onClick={this.markAsUnread}>
            <span>
              <i className="fa fa-circle" />&nbsp;Unread
            </span>
          </MenuItem>

          {message.type === "upload" && (
            <MenuItem target="_blank" href={message.fields.url}>
              <span>
                <i className="fa fa-download" />&nbsp;Download
              </span>
            </MenuItem>
          )}

          {mine && (
            <MenuItem onClick={this.edit}>
              <span>
                <i className="fa fa-pencil" />&nbsp;Edit
              </span>
            </MenuItem>
          )}

          {mine && (
            <MenuItem onClick={this.delete}>
              <span>
                <i className="fa fa-trash" />&nbsp;Delete
              </span>
            </MenuItem>
          )}

          <CopyToClipboard text={message.text_content} onCopy={this.copy}>
            <MenuItem>
              <span>
                <i className="fa fa-paste" />&nbsp;Copy
              </span>
            </MenuItem>
          </CopyToClipboard>

          <MenuItem onClick={this.toggleStar}>
            <span>
              <i className="fa fa-star-o" />&nbsp;{message.starred ? "Unstar" : "Star"}
            </span>
          </MenuItem>

          <MenuItem onClick={this.togglePin}>
            <span>
              <i className="fa fa-thumb-tack fa-rotate-45" />&nbsp;{message.pinned ? "Un-pin" : "Pin"}
            </span>
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  renderReadStatus(message) {
    const mine = message.user_id === currentUser.id;
    if (!message.read_status) return null;

    const deliveredToUsers = Object.keys(message.read_status).length;
    const readUsers = Object.values(message.read_status).filter(v => v != null)
      .length;
    return mine ? (
      <div className="message-read-status">
        {readUsers}/{deliveredToUsers} read
      </div>
    ) : null;
  }

  render() {
    const { message, messageStore, usersStore } = this.props;
    const { chatDiv, newMessageLineMessage, highlightId } = messageStore;
    const { user: { id: userId }, inserted_at: insertedAt } = message;
    const user = usersStore.usersById[userId];
    const mine = userId === currentUser.id;

    const containerClassName = cx("message-container", {
      mine
    });
    const contentClassName = cx("message-content", {
      selected: this.state.selected,
      highlight: highlightId === message.id
    });

    return (
      <div>
        {newMessageLineMessage &&
          newMessageLineMessage.id === message.id && (
            <Element name="newMessageBanner" className="new-message-banner">
              <div className="banner-text">New Messages</div>
            </Element>
          )}

        <div
          className={containerClassName}
          ref={div => {
            this.messageDiv = div;
          }}
        >
          <VisibilitySensor
            active
            onChange={this.onVisibleChange}
            intervalCheck={false}
            scrollCheck
            scrollThrottle={100}
            containment={chatDiv}
          >
            <Element name={`message_${message.id}`} className="message">
              <div className={contentClassName}>
                <div className="message-header">
                  <div className="name">
                    {`${user.first_name} ${user.last_name}`}
                  </div>

                  <div
                    className="time"
                    data-time={moment
                      .utc(insertedAt)
                      .local()
                      .format("hh:mm A")}
                  >
                    {this.renderActions(message)}
                  </div>

                  {this.renderStar(message)}
                  {this.renderPin(message)}
                </div>

                <div className="message-content-wrapper">
                  <MessageContent message={message} />
                  {this.renderEdited(message)}
                  {this.renderReadStatus(message)}
                </div>
              </div>

              <div className="message-status">{capitalize(message.status)}</div>
            </Element>
          </VisibilitySensor>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  message: PropTypes.object.isRequired
};

export default Message;
