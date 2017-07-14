import React, { Component } from "react";

import Room from "../sidemenu/room.jsx";

export default class RoomsList extends Component {
  render() {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
          <a href="#">
            <i className="fa fa-plus" />
          </a>
        </div>
        {/*<Room heading={"Favorites"} />*/}
        <Room />
        <Room />
      </div>
    );
  }
}
