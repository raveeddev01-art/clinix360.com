import React, { Component } from "react";

import RoomsList from "../sidemenu/rooms_list.jsx";
import Room from "../sidemenu/room.jsx";
import Team from "../sidemenu/team.jsx";

export default class Sidemenu extends Component {
  render() {
    return (
      <div id="sidemenu">
        <div className="flex-header">
          <h4 className="text-capitalize">Team Name</h4>

          <i className="fa fa-sliders" />
        </div>

        <div className="flex-content">
          <RoomsList heading={"Favorites"} />
          <RoomsList heading={"Groups"} />

          {/*<div className="menu-nav group m-b-20">
            <h5 className="heading">Groups</h5>
            <a href="#" className="item active">
              <div className="item-icon">
                <i className="fa fa-hashtag" />
              </div>
              <div className="item-text">general</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-hashtag" />
              </div>
              <div className="item-text">patients</div>
              <div className="item-badge text-center">3</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-hashtag" />
              </div>
              <div className="item-text">labs</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-hashtag" />
              </div>
              <div className="item-text">prescriptions</div>
            </a>
          </div>*/}

          {/*<div className="menu-nav people m-b-20">
            <h5 className="heading">People</h5>
            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle" />
              </div>
              <div className="item-text">Daniel Tapia</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle-o" />
              </div>
              <div className="item-text">Jack Roush</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle-o" />
              </div>
              <div className="item-text">Emily Hope</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle-o" />
              </div>
              <div className="item-text">Tom Davis</div>
            </a>

            <a href="#" className="item">
              <div className="item-icon">
                <i className="fa fa-circle-o" />
              </div>
              <div className="item-text">Mark Green</div>
            </a>
          </div>*/}

          <Team heading={"People"} />
        </div>
      </div>
    );
  }
}
