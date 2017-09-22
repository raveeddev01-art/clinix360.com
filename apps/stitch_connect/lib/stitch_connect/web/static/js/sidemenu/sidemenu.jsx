import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";

import FavoritesList from "./favorites/favorites_list";
import RoomsList from "./rooms/rooms_list";
import PeopleList from "./people/people_list";

@inject("sidemenuStore")
@observer
class Sidemenu extends Component {
  _adminOptions = () => {
    return (
      <div>
        <div className="separator text-center">
          <span>Admin</span>
        </div>

        <MenuItem eventKey="4" href="/admin/team">
          Team
        </MenuItem>
        <MenuItem eventKey="5" href="/admin/users/members">
          Users
        </MenuItem>
        <MenuItem eventKey="6" href="/admin/users/invitations">
          Invite
        </MenuItem>
      </div>
    );
  };

  lock = () => {
    const { sidemenuStore } = this.props;

    sidemenuStore.lock();
  };

  render() {
    const { sidemenuStore } = this.props;

    return (
      <div id="sidemenu">
        <div className="flex-header">
          <DropdownButton
            className="text-capitalize"
            block
            title={sidemenuStore.teamName}
            id="dropdown-size-medium"
          >
            <h5 className="text-center">{`${window.currentUser
              .firstName} ${window.currentUser.lastName}`}</h5>

            <div className="separator text-center">
              <span>You</span>
            </div>

            <MenuItem eventKey="1" href="/admin/you/profile">
              Profile
            </MenuItem>
            <MenuItem eventKey="2" href="/admin/you/account">
              Account
            </MenuItem>
            <MenuItem eventKey="3" href="/admin/you/notifications">
              Notifications
            </MenuItem>

            {currentUser.roles.includes("admin") && this._adminOptions()}

            <div className="separator text-center">
              <span>Stitch</span>
            </div>

            <MenuItem eventKey="7" onClick={this.lock}>
              Lockout
            </MenuItem>
            <MenuItem eventKey="6" href="/logout">
              Sign Out
            </MenuItem>
          </DropdownButton>
        </div>
        <div className="flex-content">
          <FavoritesList
            heading={"Favorites"}
            rooms={sidemenuStore.favoriteGroups}
          />

          <RoomsList heading="Rooms" rooms={sidemenuStore.normalGroups} />
          <PeopleList
            heading="Direct Messages"
            rooms={sidemenuStore.directGroups}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(Sidemenu);
