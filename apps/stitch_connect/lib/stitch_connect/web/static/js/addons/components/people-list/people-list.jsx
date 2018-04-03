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
    const { groupStore, usersStore, presenceStore, teamDirectory } = this.props;

    const groupMembers = groupStore.group.users;

    const teamMembers = usersStore.nonBotUsers;

    const users = teamDirectory ? teamMembers : groupMembers;

    const filteredAdmins = users.filter(
      user => user.roles.indexOf("admin") > -1
    );

    const filteredMembers = users.filter(
      user => user.roles.indexOf("member") > -1
    );

    const filteredGuests = users.filter(
      user =>
        user.roles.indexOf("single-room-guest") > -1 ||
        user.roles.indexOf("multi-room-guest") > -1
    );

    const renderUserList = test =>
      test
        .sort((user1, user2) => {
          // Sort users alphabetically
          if (user1.full_name.toLowerCase() < user2.full_name.toLowerCase())
            return -1;
          if (user1.full_name.toLowerCase() > user2.full_name.toLowerCase())
            return 1;
          return 0;
        })
        .map(user => (
          <PeopleListItem
            online={presenceStore.isOnline(`${user.id}`)}
            key={`user_${user.id}`}
            onClick={this._onClickItem(user)}
            user={user}
          />
        ));

    return (
      <div className="collapse-content">
        {filteredAdmins.length > 0 && (
          <div>
            <h5 className="user-list-heading">
              Admins <span>({filteredAdmins.length})</span>
            </h5>
            {renderUserList(filteredAdmins)}
          </div>
        )}

        {filteredMembers.length > 0 && (
          <div>
            <h5 className="user-list-heading">
              Members <span>({filteredMembers.length})</span>
            </h5>
            {renderUserList(filteredMembers)}
          </div>
        )}

        {filteredGuests.length > 0 && (
          <div>
            <h5 className="user-list-heading">
              Guests <span>({filteredGuests.length})</span>
            </h5>
            {renderUserList(filteredGuests)}
          </div>
        )}
      </div>
    );
  }
}

PeopleList.defaultProps = {
  teamDirectory: false
};

PeopleList.propTypes = {
  teamDirectory: PropTypes.bool
};

export default PeopleList;
