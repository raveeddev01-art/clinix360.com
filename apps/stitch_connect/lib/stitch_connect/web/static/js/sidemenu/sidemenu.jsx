import React, { Component } from "react";
import { observer } from "mobx-react";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";

import RoomsList from "./rooms/rooms_list.jsx";
import Team from "../sidemenu/team.jsx";

import sidemenuStore from "./sidemenu_store.js";

@observer
export default class Sidemenu extends Component {
  render() {
    return (
      <div id="sidemenu">
        <div className="flex-header">
          <DropdownButton
            className="text-capitalize"
            block
            title={sidemenuStore.instance.teamName}
            id="dropdown-size-medium"
          >
            <MenuItem>Daniel Tapia</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="1">Profile</MenuItem>
            <MenuItem eventKey="2">Account</MenuItem>
            <MenuItem eventKey="3">Notifications</MenuItem>
            <MenuItem eventKey="4">Invite</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="5">Sign Out</MenuItem>
          </DropdownButton>
        </div>

        <div className="flex-content">
          <RoomsList
            heading={"Favorites"}
            rooms={sidemenuStore.instance.favoriteRooms}
          />
          <RoomsList heading={"Groups"} rooms={sidemenuStore.instance.rooms} />

          <Team heading={"People"} />
        </div>
      </div>
    );
  }
}
