import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import history from "../../../../../lib/history";

@inject("usersStore", "sidemenuStore", "messageStore", "groupsStore", "addonStore")
@observer
class InternalLinkMessage extends Component {

  navigateToMessage = () => {
    const { message } = this.props;

    const messageId = message.fields[0].ref_message_id;
    const groupId = message.fields[0].ref_group_id;
    const parentMessageId = message.fields[0].parent_message_id;
    
    if(parentMessageId === "error") {
      this.goToMessageRoom(groupId, messageId);
    } else {
      this.openMessageThread(parentMessageId);
    }
  }

  jumpToMessage(messageId) {
    const { messageStore } = this.props;
    if(messageId) {
      messageStore.load(messageId).then(message => {
        messageStore.jumpToMessage(message);
      });
    }
  }

  goToMessageRoom(groupId, messageId) {
    const { sidemenuStore, groupsStore } = this.props;
    const url = groupsStore.getGroupUrl(groupId);

    sidemenuStore.onRoomMenuItemShow(groupId);
    window.focus();
    history.push(url);
    this.jumpToMessage(messageId)
  }

  openMessageThread = (messageId) => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("thread");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(false);
    addonStore.setAddonDetailPanel("Message Details", messageId);
  };

  render() {
    const { messageTextComponents } = this.props;

    return (
      <div className="internal-link" onClick={this.navigateToMessage}>
        { messageTextComponents }
      </div>
    );
  }
}

InternalLinkMessage.defaultProps = {
  message: { fields: {} }
};

InternalLinkMessage.propTypes = {
  message: PropTypes.any.isRequired
};

export default InternalLinkMessage;
