import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Connect extends Component {
  render() {
    return (
      <div className="landing-hero">
        <div className="container">
          <div className="landing-message text-center">
            <h1>CONNECT</h1>
            <Link to="/home" className="btn btn-default">
              HOME
            </Link>

            <Link to="/pricing" className="btn btn-default">
              PRICING
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
