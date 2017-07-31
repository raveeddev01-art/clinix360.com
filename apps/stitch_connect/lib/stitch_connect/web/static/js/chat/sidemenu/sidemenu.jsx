import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";

import RoomsList from "./rooms/rooms_list.jsx";
import Team from "../sidemenu/team.jsx";

import sidemenuStore from "./sidemenu_store.js";

@observer
export default class Sidemenu extends Component {
  render() {
    return (
      <div id="sidemenu">
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
