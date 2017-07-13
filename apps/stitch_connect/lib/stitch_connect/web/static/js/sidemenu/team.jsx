import React, { Component } from "react";

export default class Team extends Component {
  render() {
    return (
      <div className="menu-nav people m-b-20">
        <h5 className="heading">
          {this.props.heading}
        </h5>

        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Jack Roush</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Jack Roush</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Jack Roush</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Jack Roush</div>
        </a>
      </div>
    );
  }
}
