import React, { Component } from "react";

import Message from "./message.jsx";
import TopNav from "./top-nav/top-nav.jsx";

export default class Chat extends Component {
  render() {
    return (
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
    );
  }
}
