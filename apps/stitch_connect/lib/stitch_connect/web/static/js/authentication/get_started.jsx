import React, { Component } from "react";
import { Link } from "react-router-dom";

import Card from "../common/components/card/card";
import Footer from "./components/footer/footer";

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
        >
          <div>
            <Link
              to="/signup/email"
              className="btn btn-lg btn-primary invite-footer-btn"
            >
              Create a New Team
            </Link>
          </div>

          <div>
            <Link
              to="/signin"
              className="btn btn-lg invite-footer-btn invite-footer-btn-white"
            >
              Find Your Team
            </Link>
          </div>
        </Card>
        {!window.electronApp && <Footer />} */
      </div>
    );
  }
}
