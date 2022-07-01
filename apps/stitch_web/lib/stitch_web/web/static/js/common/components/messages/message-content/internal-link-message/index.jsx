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
      this.goToMessageRoom(groupId);
      this.jumpToMessage(messageId);
    } else {
      this.openMessageThread(parentMessageId);
    }
  }

  jumpToMessage(messageId) {
    const { messageStore } = this.props;

    messageStore.load(messageId).then(message => {
      messageStore.jumpToMessage(message);
    });
  }

  goToMessageRoom(groupId) {
    const { sidemenuStore, groupsStore } = this.props;
    // const group = groupsStore.getGroupById(groupId);
    // groupsStore.openGroup(group.slug)
    sidemenuStore.onRoomMenuItemShow(groupId);

    const url = groupsStore.getGroupUrl(groupId);
    window.focus();
    history.push(url);
  }

  openMessageThread = (messageId) => {
    const { addonStore, messageStore } = this.props;
    const message = messageStore.getMessageById(messageId);

    addonStore.setAddonPanel("thread");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(false);
    addonStore.setAddonDetailPanel("Message Details", messageId);
  };

  render() {
    const { message } = this.props;

    return (
      <div className="internal-link" onClick={this.navigateToMessage}>
        {message.text_content}
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
