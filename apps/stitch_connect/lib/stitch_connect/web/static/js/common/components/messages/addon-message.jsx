import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

import MessageHeader from "./message-header/message-header";
import MessageContent from "./message-content/message-content";
import MessageFooter from "./message-footer/message-footer";

@inject("sidemenuStore", "messageStore")
class AddonMessage extends Component {
  onJump = () => {
    const { sidemenuStore, message } = this.props;

    sidemenuStore.jumpToMessage(message);
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

AddonMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default AddonMessage;
