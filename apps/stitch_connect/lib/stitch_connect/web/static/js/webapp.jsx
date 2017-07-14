import React, { Component } from "react";

import Sidemenu from "./sidemenu/sidemenu.jsx";
import Chat from "./chat/chat.jsx";
import Addons from "./addons/addons.jsx";

import sidemenuStore from "./sidemenu/sidemenu_store.js";

export default class Webapp extends Component {
  constructor(props) {
    super();
    sidemenuStore.instance = props;
  }

  render() {
    return (
      <div id="app">
        <Sidemenu />

        <div id="main">
          <div className="flex-header main-header">
            <div className="header-content">
              <h4>
                <i className="fa fa-comments" /> General
              </h4>
            </div>

            <div className="header-nav">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
              />
              <a href="#addons-toggle" className="btn" id="addons-toggle">
                <i className="fa fa-info-circle" />
              </a>
            </div>
          </div>

          <div className="flex-content">
            <div id="chat-container">
              <Chat />

              <div className="flex-footer">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write something"
                />
              </div>
            </div>

            <Addons />
          </div>
        </div>
      </div>
    );
  }
}
