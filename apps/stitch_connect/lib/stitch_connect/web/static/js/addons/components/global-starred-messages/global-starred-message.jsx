import React, { Component } from "react";
import { observer } from "mobx-react";
import MessageHead from "../../../common/components/message-head/message-head";
import MessageText from "../../../common/components/message-text/message-text";

@observer
class GlobalStarredMessage extends Component {
  render() {
    const { message } = this.props;

    return (
      <div>
        <MessageHead timestamp={message.inserted_at} user={message.user} />
        <MessageText message={message} />
      </div>
    );
  }
}

export default GlobalStarredMessage;
