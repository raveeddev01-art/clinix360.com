import React, { Component } from "react";

export default class Room extends Component {
  render() {
    return (
      <a href="#" className="item">
        <div className="item-icon">
          <i className="fa fa-comments" />
        </div>
        <div className="item-text">
          {this.props.room.name}
        </div>
        {/*<div className="item-badge text-center">3</div>*/}
      </a>
    );
  }
}
