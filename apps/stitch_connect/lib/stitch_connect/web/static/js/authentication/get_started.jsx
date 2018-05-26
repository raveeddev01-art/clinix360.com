import React, { Component } from "react";
import { Link } from "react-router-dom";

import Card from "../common/components/card/card";

export default class GetStarted extends Component {
  render() {
    return (
      <div>
        <Card
          title="Get Started"
          description={
            <span>
              A Stitch team is a group of people using Stitch together for team
              communication, patient communication, patient management, and
              more.
              <br />Are you looking to join an existing team or create a new
              one?
            </span>
          }
          footer={<div />}
        >
          <div>
            <Link to="/signup/email" className="btn btn-lg btn-primary btn-new">
              Create a New Team
            </Link>
          </div>

          <div>
            <Link to="/signin" className="btn btn-lg btn-new btn-new-inverse">
              Find Your Team
            </Link>
          </div>
        </Card>
      </div>
    );
  }
}
