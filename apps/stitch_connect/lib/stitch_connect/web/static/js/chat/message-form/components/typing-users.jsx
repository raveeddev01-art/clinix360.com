import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("groupPresenceStore", "usersStore")
@observer
class TypingUsers extends Component {
  render() {
    const {
      groupPresenceStore: { typingUsers },
      usersStore: { usersById }
    } = this.props;
    const usernames = typingUsers
      .filter(typingUserId => !!usersById[parseInt(typingUserId, 10)])
      .map(typingUserId => usersById[parseInt(typingUserId, 10)].full_name);
    let content;

    switch (usernames.length) {
      case 0:
        content = "";
        break;

      case 1:
        content = `${usernames[0]} is typing...`;
        break;

      case 2:
        content = `${usernames.join(" and ")} are typing...`;
        break;

      default:
        content = "Multiple people are typing...";
    }

    return <div className="users-typing">{content}</div>;
  }
}

export default TypingUsers;
