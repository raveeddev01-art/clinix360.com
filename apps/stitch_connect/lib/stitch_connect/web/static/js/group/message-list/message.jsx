import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";

@inject("messageStore")
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

  render() {
    const { message } = this.props;
    const starTooltip = (
      <Tooltip id="star-tooltip">Unstar this message</Tooltip>
    );
    const pinTooltip = <Tooltip id="pin-tooltip">Pinned</Tooltip>;

    return (
      <div className="message">
        <p>
          {message.text}
        </p>

        {message.starred &&
          <OverlayTrigger placement="top" overlay={starTooltip}>
            <span
              className="message-icon icon-star"
              role="presentation"
              onClick={this.toggleStar}
            >
              <i className="fa fa-star" />
            </span>
          </OverlayTrigger>}

        {message.pinned &&
          <OverlayTrigger placement="top" overlay={pinTooltip}>
            <span
              className="message-icon icon-pin"
              role="presentation"
              onClick={this.togglePin}
            >
              <i className="fa fa-thumb-tack fa-rotate-45" />
            </span>
          </OverlayTrigger>}

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
      </div>
    );
  }
}

Message.propTypes = {
  message: PropTypes.object.isRequired
};

export default Message;
