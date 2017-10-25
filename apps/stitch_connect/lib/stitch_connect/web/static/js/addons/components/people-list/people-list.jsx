import React, { Component } from "react";
import PropTypes from "prop-types";
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
    const { groupStore, presenceStore, showAllUsers } = this.props;
    const users = showAllUsers ? groupStore.users : groupStore.onlineUsers;

    return (
      <div className="collapse-content">
        {users.map(user => (
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
  showAllUsers: true
};

PeopleList.propTypes = {
  showAllUsers: PropTypes.bool
};

export default PeopleList;
