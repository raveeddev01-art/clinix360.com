import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import cx from "classnames";
import AddonCollapse from "./components/addon-collapse/addon-collapse.jsx";

@inject("layoutStore", "groupStore", "presenceStore")
@observer
class PeopleList extends Component {
  _onCollapse = () => {
    this.props.groupStore.loadUsers();
  };

  render() {
    const { layoutStore, groupStore, presenceStore } = this.props;
    const onlineUsers = Object.keys(presenceStore.onlineUsersMap);

    return (
      <AddonCollapse icon="group" title="People" onCollapse={this._onCollapse}>
        <div>
          {!groupStore.users && <p className="muted">No users</p>}
          {groupStore.users.map(user => {
            const online = onlineUsers.indexOf(`${user.id}`) > -1;
            return (
              <div
                className="people-list-item"
                key={`user_${user.id}`}
                onClick={layoutStore.toggleAddonDetail}
              >
                <div className="item-icon">
                  {online
                    ? <i className="fa fa-circle" />
                    : <i className="fa fa-circle-o" />}
                </div>
                <div className="item-text">
                  <span>{`${user.first_name} ${user.last_name}`}</span>
                  <small>
                    {user.username}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      </AddonCollapse>
    );
  }
}

export default PeopleList;
