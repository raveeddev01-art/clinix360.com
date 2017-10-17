import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("presenceStore", "groupPresenceStore")
@observer
class TypingUsers extends Component {
  render() {
    const { groupPresenceStore: { typingUsers }, presenceStore } = this.props;
    let content;
    const username = id => presenceStore.onlineUsersMap[id].metas[0].username;

    switch (typingUsers.length) {
      case 0:
        content = <span>&nbsp;</span>;
        break;
      case 1:
        content = `${username(typingUsers[0])} is typing...`;
        break;
      case 2:
        content = `${typingUsers.map(username).join(" and ")} are typing...`;
        break;
      default:
        content = "multiple people are typing...";
    }

    return <div className="users-typing">{content}</div>;
  }
}

export default TypingUsers;
