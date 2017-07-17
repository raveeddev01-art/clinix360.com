import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Room from "./room.jsx";

import sidemenuStore from "../sidemenu_store.js";

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
            overlay={<Tooltip id="create-new-group">Create new group</Tooltip>}
          >
            <a href="#">
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>

        {this.props.rooms.map(room => {
          return <Room room={room} />;
        })}
      </div>
    );
  }
}
