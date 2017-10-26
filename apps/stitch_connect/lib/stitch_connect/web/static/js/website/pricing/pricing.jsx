import React, { Component } from "react";
import { Link } from "react-router-dom";
// import CreateTeamForm from "./create-team";
// import Navigation from "./navigation";

export default class Jobs extends Component {
  render() {
    return (
      <div className="landing-hero">
        <div className="container">
          {/* <Navigation /> */}

          <div className="landing-message text-center">
            <h1>PRICING</h1>
            <Link to="/" className="btn btn-default">
              HOME
            </Link>

            <Link to="/pricing" className="btn btn-default">
              PRICING
            </Link>

            <Link to="/jobs" className="btn btn-default">
              JOBS
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
