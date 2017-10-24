import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Dropdown from "react-bootstrap/lib/Dropdown";

import FavoritesList from "./favorites/favorites_list";
import RoomsList from "./rooms/rooms_list";
import PeopleList from "./people/people_list";

@inject("presenceStore", "sidemenuStore")
@observer
class Sidemenu extends Component {
  _adminOptions = () => {
    return (
      <div>
        <div className="separator text-center">
          <span>Admin</span>
        </div>
        <MenuItem eventKey="4" href="/admin/team/settings" target="_blank">
          Settings
        </MenuItem>
        <MenuItem eventKey="5" href="/admin/team/security" target="_blank">
          Security
        </MenuItem>
        <MenuItem eventKey="6" href="/admin/users/members" target="_blank">
          Members
        </MenuItem>
        <MenuItem eventKey="7" href="/admin/users/invitations" target="_blank">
          Invitations
        </MenuItem>
        <MenuItem eventKey="8" href="/admin/users/pending" target="_blank">
          Pending
        </MenuItem>
        <MenuItem eventKey="9" href="/admin/billing" target="_blank">
          Billing
        </MenuItem>
      </div>
    );
  };

  render() {
    const { sidemenuStore } = this.props;
    const filterJoined = rooms => rooms.filter(room => room.joined);

    return (
      <div id="sidemenu">
        <div className="flex-header">
          <div className="team-name">{sidemenuStore.teamName}</div>

          <Dropdown
            id="dropdown-preferences-menu"
            pullRight
            componentClass="div"
          >
            <Dropdown.Toggle noCaret bsStyle="link">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-preferences">Preferences</Tooltip>
                }
              >
                <i className="fa fa-chevron-down" />
              </OverlayTrigger>
            </Dropdown.Toggle>

            <Dropdown.Menu className="super-colors">
              <h5 className="text-center">{`${window.currentUser
                .firstName} ${window.currentUser.lastName}`}</h5>

              <div className="separator text-center">
                <span>You</span>
              </div>
              <MenuItem eventKey="1" href="/admin/you/account" target="_blank">
                Account
              </MenuItem>
              <MenuItem eventKey="2" href="/admin/you/profile" target="_blank">
                Profile
              </MenuItem>
              <MenuItem
                eventKey="3"
                href="/admin/you/notifications"
                target="_blank"
              >
                Notifications
              </MenuItem>

              {currentUser.roles.includes("admin") && this._adminOptions()}

              <div className="separator text-center">
                <span>Stitch</span>
              </div>

              <MenuItem eventKey="10" onClick={this.props.presenceStore.lock}>
                Lockout
              </MenuItem>
              <MenuItem eventKey="11" href="/logout">
                Sign Out
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="flex-content">
          <FavoritesList
            heading={"Favorites"}
            rooms={sidemenuStore.favoriteGroups}
          />

          <RoomsList
            heading="Rooms"
            rooms={filterJoined(sidemenuStore.normalGroups)}
          />
          <PeopleList
            heading="Direct Messages"
            rooms={filterJoined(sidemenuStore.directGroups)}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(Sidemenu);
