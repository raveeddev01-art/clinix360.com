import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";

import AddonCollapse from "../addon-collapse/addon-collapse.jsx";
import PeoplelistItem from "../people-list-item/people-list-item.jsx";

@inject("addonStore", "groupStore", "presenceStore")
@observer
class PeopleList extends Component {
  _onCollapse = () => {
    this.props.groupStore.loadUsers();
  };

  _onClickItem = user => () => {
    const { addonStore } = this.props;

    addonStore.setAddonDetailPanel("people", user);
    addonStore.toggleAddonDetail();
  };

  render() {
    const { addonStore, groupStore, presenceStore } = this.props;
    const onlineUsers = Object.keys(presenceStore.onlineUsersMap);

    return (
      <AddonCollapse icon="group" title="People" onCollapse={this._onCollapse}>
        <div>
          {groupStore.users.map(user => {
            const online = onlineUsers.indexOf(`${user.id}`) > -1;
            if (!online) return null;
            return (
              <PeoplelistItem
                online={online}
                key={`user_${user.id}`}
                onClick={this._onClickItem(user)}
                {...user}
              />
            );
          })}
          {groupStore.users.map(user => {
            const online = onlineUsers.indexOf(`${user.id}`) > -1;
            if (online) return null;
            return (
              <PeoplelistItem
                online={online}
                key={`user_${user.id}`}
                onClick={this._onClickItem(user)}
                {...user}
              />
            );
          })}
        </div>
      </AddonCollapse>
    );
  }
}

export default PeopleList;
