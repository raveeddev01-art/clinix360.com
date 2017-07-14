import React, { Component } from "react";

import Message from "../chat/message.jsx";

export default class Chat extends Component {
  render() {
    return (
      <div id="chat">
        <div className="date-separator">
          <span className="date">July 13, 2017</span>
        </div>

        <Message />
      </div>
    );
  }
}
