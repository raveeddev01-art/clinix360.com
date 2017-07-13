import React, { Component } from "react";

export default class Chat extends Component {
  render() {
    return (
      <div id="chat">
        <div className="message">
          <div className="content">
            <h4>Mark Green</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum sit amet congue dui.
            </p>
          </div>
        </div>

        <div className="message message-own">
          <div className="content">
            <h4>Mark Green</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum sit amet congue dui.
            </p>
          </div>
        </div>

        <div className="message">
          <div className="content">
            <h4>Mark Green</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum sit amet congue dui.
            </p>
          </div>
        </div>

        <div className="message">
          <div className="content">
            <h4>Mark Green</h4>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum sit amet congue dui.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
