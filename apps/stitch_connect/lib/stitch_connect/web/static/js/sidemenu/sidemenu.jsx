import React, { Component } from "react";
import { observer } from "mobx-react";

import RoomsList from "./rooms/rooms_list.jsx";
import Team from "../sidemenu/team.jsx";

import sidemenuStore from "./sidemenu_store.js";

@observer
export default class Sidemenu extends Component {
  render() {
    return (
      <div id="sidemenu">
        <div className="flex-header">
          <h4 className="text-capitalize">
            {sidemenuStore.instance.teamName}
          </h4>

          <i className="fa fa-sliders" />
        </div>

        <div className="flex-content">
          <RoomsList
            heading={"Favorites"}
            rooms={sidemenuStore.instance.favoriteRooms}
          />
          <RoomsList heading={"Groups"} rooms={sidemenuStore.instance.rooms} />

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
