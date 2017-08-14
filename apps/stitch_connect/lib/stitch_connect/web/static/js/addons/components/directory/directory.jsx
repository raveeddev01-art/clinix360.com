import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PeopleList from "../people-list/people-list";

@inject("groupStore")
@observer
class Directory extends Component {
  render() {
    const { groupStore } = this.props;

    return (
      <div className="directory-addon">
        <div className="status">
          <span>
            {groupStore.onlineUsers.length}/{groupStore.users.length} Members
          </span>
          <button
            className="btn-fancy btn-default btn-small"
            onClick={groupStore.toggleAllUsers}
          >
            {groupStore.showAllUsers ? "Show only online" : "Show all"}
          </button>
        </div>

        <PeopleList showAllUsers={groupStore.showAllUsers} />
      </div>
    );
  }
}

export default Directory;
