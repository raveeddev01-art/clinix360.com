import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import moment from "moment";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CopyToClipboard from "react-copy-to-clipboard";
import UserMention from "./user-mention";

@inject("messageStore", "groupStore", "sidemenuStore")
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
    const { pinned, pinned_by, pinned_at } = message;

    if (!pinned || !pinned_at || !pinned_by) {
      return null;
    }

    const pinTooltip = (
      <Tooltip id="pin-tooltip">
        <span>
          Pinned by{" "}
          {pinned_by.id === currentUser.id
            ? "You"
            : `${pinned_by.first_name} ${pinned_by.last_name}`}
        </span>
        <br />
        <span className="text-muted">
          {pinned_at && moment(pinned_at).calendar()}
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
    return (
      <Dropdown
        id={`message-actions-${message.id}`}
        componentClass="div"
        className="message-actions"
        pullRight
      >
        <Dropdown.Toggle useAnchor />
        <Dropdown.Menu>
          <MenuItem>
            <CopyToClipboard text={message.text_content} onCopy={this.copy}>
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

  renderMessage = () => {
    const { message, sidemenuStore } = this.props;
    const words = message.text_content.split(" ");
    const usernameMap = sidemenuStore.usernameMap;

    return words.reduce((prev, word, i) => {
      if (word.indexOf("@") === 0) {
        const username = word.substr(1);
        if (usernameMap[username]) {
          return prev.concat(
            <UserMention
              key={`usermention_${i}`}
              user={usernameMap[username]}
            />
          );
        }
      }

      if (typeof prev[prev.length - 1] === "string") {
        prev[prev.length - 1] += ` ${word}`;
        return prev;
      }

      return prev.concat(word);
    }, []);
  };

  render() {
    const { message } = this.props;

    return (
      <div className="message">
        <div>
          {this.renderMessage()}
        </div>

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
