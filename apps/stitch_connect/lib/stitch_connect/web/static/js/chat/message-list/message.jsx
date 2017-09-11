import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import moment from "moment";
import { Element } from "react-scroll";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";
import VisibilitySensor from "react-visibility-sensor";

import { confirm } from "../../common/modals";
import MessageContent from "../../common/components/messages/message-content/message-content";

@inject("messageStore", "groupStore", "sidemenuStore")
@observer
class Message extends Component {
  componentDidMount() {
    const { message, messageStore } = this.props;

    messageStore.onMessageMounted(message.id, this.messageDiv);
  }

  onVisibleChange = isVisible => {
    const { message, messageStore } = this.props;

    if (!isVisible && messageStore.loadedInitial) {
      messageStore.onInvisibleMessage(message.id);
    }

    if (isVisible && messageStore.loadedInitial) {
      messageStore.onVisibleMessage(message.id);
    }
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
    }).then(result => {
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
      <Tooltip id="edited-tooltip">
        {moment(editedAt).calendar()}
      </Tooltip>
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
    const { pinned, pinned_by: pinnedBy, pinned_at: pinnedAt } = message;

    if (!pinned || !pinnedAt || !pinnedBy) {
      return null;
    }

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

    return (
      <Dropdown
        id={`message-actions-${message.id}`}
        componentClass="div"
        className="message-actions"
        pullRight
      >
        <Dropdown.Toggle useAnchor />
        <Dropdown.Menu>
          {mine &&
            <MenuItem onClick={this.edit}>
              <span>
                <i className="fa fa-pencil" />&nbsp;Edit
              </span>
            </MenuItem>}

          {mine &&
            <MenuItem onClick={this.delete}>
              <span>
                <i className="fa fa-trash" />&nbsp;Delete
              </span>
            </MenuItem>}

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

  render() {
    const { message, messageStore } = this.props;
    const { chatDiv } = messageStore;

    return (
      <VisibilitySensor
        active
        onChange={this.onVisibleChange}
        intervalCheck={false}
        scrollCheck
        scrollThrottle={100}
        containment={chatDiv}
        offset={{ top: 70 }}
      >
        <Element name={`msg_${message.id}`}>
          <div
            className="message"
            ref={div => {
              this.messageDiv = div;
            }}
          >
            <div>
              <MessageContent message={message} />
              {this.renderEdited(message)}
            </div>

            {this.renderStar(message)}
            {this.renderPin(message)}
            {this.renderActions(message)}
          </div>
        </Element>
      </VisibilitySensor>
    );
  }
}

Message.propTypes = {
  message: PropTypes.object.isRequired
};

export default Message;
