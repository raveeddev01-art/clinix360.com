import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import { Avatar, UserProfileMenu } from "common/components";

import MessageHeader from "./message-header/message-header";
import MessageContent from "./message-content/message-content";
import MessageNav from "./message-nav";

@inject("sidemenuStore", "messageStore", "usersStore")
class AddonMessage extends Component {
  onJump = () => {
    const { sidemenuStore, message } = this.props;

    sidemenuStore.jumpToMessage(message);
  };

  render() {
    const { message, usersStore } = this.props;
    const userId = message.user.id;
    const user = usersStore.usersById[userId];

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
          <MessageNav message={message} />

          <div className="message-wrapper">
            <UserProfileMenu user={user}>
              <Avatar user={user} />
            </UserProfileMenu>

            <div className="message-content">
              <MessageHeader timestamp={message.inserted_at} user={user} />
              <MessageContent
                message={Object.assign({}, message, { reactions_web: null })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AddonMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default AddonMessage;
