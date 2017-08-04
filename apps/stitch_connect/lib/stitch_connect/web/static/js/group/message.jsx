import React, { Component } from "react";

export default class Message extends Component {
  render() {
    return (
      <div>
        <div className="message">
          <div className="content">
            <h4>Mark Green</h4>
            <div className="content-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum sit amet congue dui.
            </div>
          </div>
        </div>

        <div className="message message-own">
          <div className="content">
            <h4>Mark Green</h4>
            <div className="content-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum sit amet congue dui.
            </div>
          </div>
        </div>
      </div>
    );
  }
}
