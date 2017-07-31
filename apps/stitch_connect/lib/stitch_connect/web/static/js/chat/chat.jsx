import React, { Component } from "react";

import Message from "../chat/message.jsx";
import Sidemenu from "./sidemenu/sidemenu.jsx";
import Addons from "../addons/addons.jsx";

export default class Chat extends Component {
  render() {
    return (
      <div className="flex-wrapper">
        <Sidemenu />
        <div id="main">
          <div className="flex-content">
            <div id="chat-container">
              <div id="chat">
                <div className="date-separator">
                  <span className="date">July 13, 2017</span>
                </div>
                <Message />
              </div>
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
