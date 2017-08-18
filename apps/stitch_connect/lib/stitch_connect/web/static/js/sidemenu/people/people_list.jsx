import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { NavLink, withRouter } from "react-router-dom";
import _ from "lodash";

@inject("sidemenuStore", "presenceStore")
@observer
class PeopleList extends Component {
  render() {
    const { sidemenuStore, presenceStore } = this.props;
    const onlineUsers = presenceStore.onlineUsers;
    const offlineUsers = _.differenceBy(sidemenuStore.users, onlineUsers, "id");
    const multiDMGroups = sidemenuStore.multiDMGroups;
    return (
      <div>
        {onlineUsers.map(user =>
          <NavLink
            key={`online-user-${user.id}`}
            to={`/direct/${user.username}`}
            className="item"
            activeClassName="active"
          >
            <div className="item-icon">
              <i className="fa fa-circle" />
            </div>
            <div className="item-text">
              {`${user.first_name} ${user.last_name}`}
            </div>
          </NavLink>
        )}

        {offlineUsers.map(user =>
          <NavLink
            key={`offline-user-${user.id}`}
            to={`/direct/${user.username}`}
            className="item"
            activeClassName="active"
          >
            <div className="item-icon">
              <i className="fa fa-circle-o" />
            </div>
            <div className="item-text">
              {`${user.first_name} ${user.last_name}`}
            </div>
          </NavLink>
        )}

        {multiDMGroups.map(group => {
          const users = _.differenceBy(group.users, [currentUser], "id");
          const groupName = users.map(user => user.first_name).join(", ");
          const slug = group.users.map(user => user.username).join(",");
          return (
            <NavLink
              key={`multi-dm-${group.id}`}
              to={`/direct/${slug}`}
              className="item"
              activeClassName="active"
            >
              <div className="item-icon">
                <i className="fa fa-link" />
              </div>
              <div className="item-text">
                {groupName}
              </div>
            </NavLink>
          );
        })}
      </div>
    );
  }
}

export default withRouter(PeopleList);
