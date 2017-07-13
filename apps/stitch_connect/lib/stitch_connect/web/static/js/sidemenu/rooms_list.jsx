import React, { Component } from "react";

import Room from "../sidemenu/room.jsx";

export default class RoomsList extends Component {
  render() {
    return (
      <div className="menu-nav m-b-20">
        <h5 className="heading">
          {this.props.heading}
        </h5>
        {/*<Room heading={"Favorites"} />*/}
        <Room />
        <Room />
      </div>
    );
  }
}
