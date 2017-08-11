import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PeopleListItem from "./people-list-item/people-list-item";

@inject("addonStore", "groupStore", "presenceStore")
@observer
class PeopleList extends Component {
  _onClickItem = user => () => {
    const { addonStore } = this.props;

    addonStore.setAddonDetailPanel("people", user);
    addonStore.toggleAddonDetail();
  };

  render() {
    const { groupStore, presenceStore } = this.props;
    const onlineUsers = Object.keys(presenceStore.onlineUsersMap);

    return (
      <div>
        {groupStore.users
          .filter(user => onlineUsers.indexOf(`${user.id}`) > -1)
          .map(user =>
            <PeopleListItem
              online={true}
              key={`user_${user.id}`}
              onClick={this._onClickItem(user)}
              {...user}
            />
          )}
        {groupStore.users
          .filter(user => onlineUsers.indexOf(`${user.id}`) === -1)
          .map(user =>
            <PeopleListItem
              online={false}
              key={`user_${user.id}`}
              onClick={this._onClickItem(user)}
              {...user}
            />
          )}
      </div>
    );
  }
}

export default PeopleList;
