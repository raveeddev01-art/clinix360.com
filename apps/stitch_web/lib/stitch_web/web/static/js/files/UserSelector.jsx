import React, { Component } from "react";
import { Typeahead } from 'react-bootstrap-typeahead';
import _ from 'lodash';

const defaultSelected = (users, myFilesOnly) => {
  if (myFilesOnly) {
    const currentUserId = currentUser.id;
    const user = _.find(users, user => user.id == currentUserId);
    return [user];
  } else {
    return undefined;
  }
}

const UserSelector = ({ users, onSelect, myFilesOnly }) =>
  <Typeahead
    labelKey="full_name"
    multiple={false}
    disabled={!!myFilesOnly}
    selected={defaultSelected(users, myFilesOnly)}
    options={users}
    onChange={selected => {
      if (selected.length == 0) {
        onSelect(null);
      } else {
        onSelect(selected[0].id);
      }
    }}
    renderMenuItemChildren={(user) => (
      <div className=".user-list-item" key={user.id}>
        <div className="item-text" style={{ flexGrow: 1, display: "flex" }}>
          <div className="avatar">
            <img className="img-circle" src={user.avatar_thumb} style={{ width: "20px", height: "20px" }} />
          </div>
          <span className="username">{user.full_name}</span>
          <span className="text-muted">{user.username}</span>
        </div>
      </div>
    )}
    placeholder="Search by name" />

export default UserSelector;
