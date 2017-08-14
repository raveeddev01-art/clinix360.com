import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
import moment from "moment";

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
    const { messageStore, messagePool } = this.props;
    const messageId = messagePool[0].id;

    messageStore.togglePin(messageId);
  };

  toggleStar = () => {
    const { messageStore, messagePool } = this.props;
    const messageId = messagePool[0].id;

    messageStore.toggleStar(messageId);
  };

  render() {
    const { messagePool } = this.props;
    const { id, starred, pinned, user, createdAt: timestamp } = messagePool[0];
    const className = cx("message", {
      "message-own": user.id === currentUser.id
    });
    const text = messagePool.map(msg => msg.text).join("\n");
    const timestampTooltip = (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );
    const starTooltip = (
      <Tooltip id="star-tooltip">Unstar this message</Tooltip>
    );
    const pinTooltip = <Tooltip id="pin-tooltip">Pinned</Tooltip>;

    return (
      <div className={className}>
        <div className="content">
          <div className="content-header">
            {`${user.first_name} ${user.last_name} `}

            <OverlayTrigger placement="top" overlay={timestampTooltip}>
              <span className="time">
                {moment(timestamp).format("HH:mm A")}
              </span>
            </OverlayTrigger>

            {starred &&
              <OverlayTrigger placement="top" overlay={starTooltip}>
                <span
                  className="message-icon icon-star"
                  role="presentation"
                  onClick={this.toggleStar}
                >
                  <i className="fa fa-star" />
                </span>
              </OverlayTrigger>}

            {pinned &&
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
              id={`message-actions-${id}`}
              componentClass="div"
              className="message-actions"
            >
              <Dropdown.Toggle useAnchor />
              <Dropdown.Menu>
                <MenuItem>
                  <CopyToClipboard text={text} onCopy={this.copy}>
                    <span>
                      <i className="fa fa-paste" />&nbsp;Copy
                    </span>
                  </CopyToClipboard>
                </MenuItem>
                <MenuItem onClick={this.toggleStar}>
                  <span>
                    <i className="fa fa-star-o" />&nbsp;{starred ? "Unstar" : "Star"}
                  </span>
                </MenuItem>
                <MenuItem onClick={this.togglePin}>
                  <span>
                    <i className="fa fa-thumb-tack fa-rotate-45" />&nbsp;{pinned ? "Un-pin" : "Pin"}
                  </span>
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="content-body">
            {messagePool.map(msg =>
              <p key={`text_${msg.id}`}>
                {msg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  messagePool: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Message;
