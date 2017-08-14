import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import cx from "classnames";
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

  toggleStar = () => {
    const { messageStore, messagePool } = this.props;
    const messageId = messagePool[0].id;

    messageStore.toggleStar(messageId);
  };

  render() {
    const { messagePool, groupStore } = this.props;
    const { id, starred, user_id, inserted_at: timestamp } = messagePool[0];
    const user = groupStore.userMap[user_id] || {};
    const className = cx("message", {
      "message-own": user_id === currentUser.id
    });
    const text = messagePool.map(msg => msg.text_content).join("\n");
    const timestampTooltip = (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );
    const starTooltip = (
      <Tooltip id="star-tooltip">Unstar this message</Tooltip>
    );

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
                  className="icon-star"
                  role="link"
                  onClick={this.toggleStar}
                >
                  <i className="fa fa-star" />
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
                      <i className="fa fa-paste" /> Copy
                    </span>
                  </CopyToClipboard>
                </MenuItem>
                <MenuItem onClick={this.toggleStar}>
                  <span>
                    <i className="fa fa-star-o" /> {starred ? "Unstar" : "Star"}
                  </span>
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="content-body">
            {messagePool.map(msg =>
              <p key={`text_${msg.id}`}>
                {msg.text_content}
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
