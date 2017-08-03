import React, { Component } from "react";

import Chat from "./chat.jsx";
import Addons from "../addons/addons.jsx";
import TopNav from "./top-nav/top-nav.jsx";

export default class ChatContainer extends Component {
  render() {
    return (
      <div className="chat-wrapper">
        <div id="main">
          <TopNav />
          <div className="flex-content">
            <Chat />
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}
