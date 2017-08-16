import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import moment from "moment";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";

@inject("messageStore", "groupStore")
@observer
class Message extends Component {
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

  renderStar(message) {
    const starTooltip = message.starred
      ? <Tooltip id="star-tooltip">Unstar this message</Tooltip>
      : null;

    return (
      message.starred &&
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
    const pinTooltip = message.pinned
      ? <Tooltip id="pin-tooltip">
          <span>
            Pinned by{" "}
            {message.pinnedBy.id === window.currentUser.id
              ? "You"
              : `${message.pinnedBy.firstName} ${message.pinnedBy.lastName}`}
          </span>
          <br />
          <span className="text-muted">
            {moment(message.pinnedAt).calendar()}
          </span>
        </Tooltip>
      : null;

    return (
      message.pinned &&
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
    return (
      <Dropdown
        id={`message-actions-${message.id}`}
        componentClass="div"
        className="message-actions"
      >
        <Dropdown.Toggle useAnchor />
        <Dropdown.Menu>
          <MenuItem>
            <CopyToClipboard text={message.text} onCopy={this.copy}>
              <span>
                <i className="fa fa-paste" />&nbsp;Copy
              </span>
            </CopyToClipboard>
          </MenuItem>
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
    const { message } = this.props;

    return (
      <div className="message">
        <p>
          {message.text}
        </p>

        {this.renderStar(message)}
        {this.renderPin(message)}
        {this.renderActions(message)}
      </div>
    );
  }
}

Message.propTypes = {
  message: PropTypes.object.isRequired
};

export default Message;
