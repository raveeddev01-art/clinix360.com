import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import flatten from "lodash/flatten";

@inject("usersStore", "groupStore")
@observer
class TypingUsers extends Component {
  render() {
    const {
      groupStore: { typingUsers },
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
        content = (
          <span>
            <b>{usernames[0]}</b> is typing...
          </span>
        );
        break;

      case 2:
        content = (
          <span>
            {flatten(
              usernames.map(user => [<b>{user}</b>, <span> and </span>])
            ).slice(0, -1)}{" "}
            are typing...
          </span>
        );
        break;

      default:
        content = "Multiple people are typing...";
    }

    return <div className="users-typing">{content}</div>;
  }
}

export default TypingUsers;
