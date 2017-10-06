import React, { Component } from "react";
import { inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

import MessageHeader from "./message-header/message-header";
import MessageContent from "./message-content/message-content";
import MessageFooter from "./message-footer/message-footer";

@inject("sidemenuStore", "messageStore")
class AddonMessage extends Component {
  onJump = () => {
    const { history, sidemenuStore, messageStore, message } = this.props;
    const group = sidemenuStore.getGroupById(message.group_id);
    let url;

    if (group.slug.indexOf("__dm:") === -1) {
      // If normal group
      url = `/rooms/${group.slug}`;
    } else if (group.users.length > 2) {
      // If multi direct messaging
      const multiMessagingSlug = group.users
        .map(user => user.username)
        .join(",");
      url = `/direct/${multiMessagingSlug}`;
    } else {
      // If single direct messaging
      const recipient = group.users.find(user => user.id !== currentUser.id);
      url = `/direct/${recipient.username}`;
    }

    history.push(url);
    messageStore.jumpToMessage(message);
  };

  render() {
    const { message } = this.props;

    return (
      <div className="message-container addon">
        <div className="addon-message-actions">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="jump-to-message">Jump</Tooltip>}
          >
            <a
              role="link"
              className="addon-message-action-item"
              onClick={this.onJump}
            >
              <i className="fa fa-hand-o-left" />
            </a>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="permalink-message">Permalink</Tooltip>}
          >
            <a
              role="link"
              className="addon-message-action-item"
              onClick={() => {}}
            >
              <i className="fa fa-link" />
            </a>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="copy-message">Copy</Tooltip>}
          >
            <a
              role="link"
              className="addon-message-action-item"
              onClick={() => {}}
            >
              <i className="fa fa-clipboard" />
            </a>
          </OverlayTrigger>
        </div>
        <div className="message">
          <MessageHeader timestamp={message.inserted_at} user={message.user} />
          <MessageContent message={message} />
          <MessageFooter message={message} />
        </div>
      </div>
    );
  }
}

export default withRouter(AddonMessage);
