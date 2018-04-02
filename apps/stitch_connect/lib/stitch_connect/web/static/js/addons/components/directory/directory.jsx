import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PeopleList from "../people-list/people-list";

@inject("usersStore")
@observer
class Directory extends Component {
  render() {
    const { usersStore } = this.props;

    return (
      <div className="directory-addon">
        <div className="status">
          <span>
            {usersStore.showAllUsers
              ? usersStore.users.length
              : usersStore.onlineUsers.length}{" "}
            Members
          </span>
          <button
            className="btn-fancy btn-default btn-small"
            onClick={usersStore.toggleAllUsers}
          >
            {usersStore.showAllUsers ? "Show only online" : "Show all"}
          </button>
        </div>

        <PeopleList teamDirectory showAllUsers={usersStore.showAllUsers} />
      </div>
    );
  }
}

export default Directory;
