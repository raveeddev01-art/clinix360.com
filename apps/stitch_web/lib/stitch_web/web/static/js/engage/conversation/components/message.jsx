import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import { Avatar, MessageHeader } from "common/components";

@inject("inboxStore", "usersStore")
@observer
class Message extends Component {
  render() {
    const {
      conversation: { text_content, provider_id, inserted_at }
    } = this.props;
    const user = this.props.usersStore.getUserById(provider_id);

    return (
      <div className="message">
        <div className="message__gutter">
          <Avatar user={user} />
        </div>

        <div className="message__content">
          <MessageHeader user={user} timestamp={inserted_at} disabledMenu />
          <p>{text_content}</p>
        </div>
      </div>
    );
  }
}

export default Message;
