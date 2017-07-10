import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class Room extends Component {
  render() {
    return (
      <div>
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
