import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Room from "../sidemenu/room.jsx";

export default class RoomsList extends Component {
  render() {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Create new group</Tooltip>}
          >
            <a href="#">
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>
        {/*<Room heading={"Favorites"} />*/}
        <Room />
        <Room />
      </div>
    );
  }
}
