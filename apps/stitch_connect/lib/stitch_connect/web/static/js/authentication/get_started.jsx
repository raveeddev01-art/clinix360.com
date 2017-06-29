import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class GetStarted extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Healthcare Messaging</h2>

        <h4>
          Communicate, write notes, track tasks, upload files, and collaborate
          on any device.
        </h4>

        <Link to="/signin" className="btn btn-block btn-lg btn-primary">Sign In</Link>
        <Link
          to="/signup/email"
          className="btn btn-block btn-lg btn-default m-b-40"
        >
          Create Team
        </Link>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
