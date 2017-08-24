import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import MessageHead from "../../../common/components/message-head/message-head";
import getMessageText from "../../../common/get-message-text/get-message-text";

@inject("sidemenuStore")
@observer
class GlobalStarredMessage extends Component {
  render() {
    const { message, sidemenuStore } = this.props;

    return (
      <div>
        <MessageHead timestamp={message.inserted_at} user={message.user} />
        {getMessageText(message.text_content, sidemenuStore.usernameMap)}
      </div>
    );
  }
}

export default GlobalStarredMessage;
