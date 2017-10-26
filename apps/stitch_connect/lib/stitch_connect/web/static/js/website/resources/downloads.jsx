import React, { Component } from "react";
import { Link } from "react-router-dom";
// import CreateTeamForm from "./create-team";
// import Navigation from "./navigation";

export default class Downloads extends Component {
  render() {
    return (
      <div className="landing-hero">
        <div className="container">
          {/* <Navigation /> */}

          <div className="landing-message text-center">
            <h1>DOWNLOADS</h1>
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
