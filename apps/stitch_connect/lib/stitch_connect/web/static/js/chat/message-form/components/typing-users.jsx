import React, { Component } from "react";
import { inject, observer } from "mobx-react";

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
            {/* <b>{usernames.join(" and ")}</b> are typing... */}
            {/* {usernames.map(user => <b>{user}</b>).join(" and ")} are typing... */}

            {usernames
              .map(user => {
                return <b>{user}</b>;
              })
              .join(" and ")}
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
