import React, { Component } from "react";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

import MessageHeader from "./message-header/message-header";
import MessageContent from "./message-content/message-content";
import MessageFooter from "./message-footer/message-footer";

class AddonMessage extends Component {
  render() {
    const { message } = this.props;

    return (
      <div className="message-pool-container addon">
        <div className="addon-message-actions">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="open-a-direct-message">Jump</Tooltip>}
          >
            <a
              role="link"
              className="addon-message-action-item"
              onClick={() => {}}
            >
              <i className="fa fa-hand-o-left" />
            </a>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="open-a-direct-message">Permalink</Tooltip>}
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
            overlay={<Tooltip id="open-a-direct-message">Copy</Tooltip>}
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
        <div className="message-pool">
          <MessageHeader timestamp={message.inserted_at} user={message.user} />
          <MessageContent message={message} />
          <MessageFooter message={message} />
        </div>
      </div>
    );
  }
}

export default AddonMessage;
