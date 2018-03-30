import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import PeopleListItem from "./people-list-item/people-list-item";

@inject("addonStore", "groupStore", "presenceStore", "usersStore")
@observer
class PeopleList extends Component {
  _onClickItem = user => () => {
    const { addonStore } = this.props;

    addonStore.setAddonDetailPanel("people", user);
    addonStore.toggleAddonDetail();
  };

  render() {
    const {
      groupStore,
      usersStore,
      presenceStore,
      showAllUsers,
      teamDirectory
    } = this.props;

    const groupMembers = groupStore.group.users;

    const teamMembers = showAllUsers
      ? usersStore.users
      : usersStore.onlineUsers;

    const users = teamDirectory ? teamMembers : groupMembers;

    return (
      <div className="collapse-content">
        {users
          .filter(user => !user.disabled)
          .map(user => (
            <PeopleListItem
              online={presenceStore.isOnline(`${user.id}`)}
              key={`user_${user.id}`}
              onClick={this._onClickItem(user)}
              {...user}
            />
          ))}
      </div>
    );
  }
}

PeopleList.defaultProps = {
  showAllUsers: true,
  teamDirectory: false
};

PeopleList.propTypes = {
  showAllUsers: PropTypes.bool,
  teamDirectory: PropTypes.bool
};

export default PeopleList;
