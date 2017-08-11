import React, { Component } from "react";

import Favorite from "./favorite";
import sidemenuStore from "../sidemenu_store.js";

export default class FavoritesList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
        </div>

        {this.props.rooms.map(room => {
          return <Favorite key={`room-${room.id}`} room={room} />;
        })}
      </div>
    );
  }
}
