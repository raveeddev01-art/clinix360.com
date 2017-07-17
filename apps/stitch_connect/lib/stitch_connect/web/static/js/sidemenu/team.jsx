import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

export default class Team extends Component {
  render() {
    return (
      <div className="menu-nav people m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="open-a-direct-message">
                Open a Direct Message
              </Tooltip>
            }
          >
            <a href="#">
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>

        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">John Appleseed</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Jason Plex</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Emily Braun</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">James Myers</div>
        </a>
      </div>
    );
  }
}
