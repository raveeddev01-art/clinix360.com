import React, { Component } from "react";
import { Link } from "react-router-dom";
// import CreateTeamForm from "./create-team";
// import Navigation from "./navigation";

export default class Landing extends Component {
  render() {
    return (
      <div className="landing-hero">
        <div className="container">
          {/* <Navigation /> */}

          <div className="landing-message text-center">
            <h1>Care Coordination</h1>
            <h3>
              Communicate, write notes, track tasks, <br />upload files, and
              collaborate on any device.
            </h3>

            {/* <CreateTeamForm /> */}

            <div className="trial">
              Get started with an unlimited <br className="visible-xs-inline" />number
              of people on our free 14-day trial.
            </div>

            <Link to="/" className="btn btn-default">
              HOME
            </Link>

            <Link to="/pricing" className="btn btn-default">
              PRICING
            </Link>

            <Link to="/downloads" className="btn btn-default">
              DOWNLOADS
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
