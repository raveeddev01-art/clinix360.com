import React, { Component } from "react";
import { Link } from "react-router-dom";

import { AuthenticationPage } from "common/components";
import OrLine from "./components/or-line/or-line";

export default class GetStarted extends Component {
  render() {
    return (
      <div>
        <AuthenticationPage
          title="Get Started"
          description={
            <span>
              A Stitch team is a group of people using Stitch together for team
              communication, patient communication, patient management, and
              more.
              <br />
              <br />
              Are you looking to join an existing team or create a new one?
            </span>
          }
          headerType="signin"
        >
          <div className="get-started-links">
            <div className="get-started-link-wrapper">
              <Link
                to="/signup/email"
                className="btn btn-onboarding btn-onboarding-primary"
              >
                Create a New Team
              </Link>
              <div className="get-started-link-description">
                Set up your team on Stitch
              </div>
            </div>
            <OrLine />
            <div className="get-started-link-wrapper">
              <Link
                to="/find-your-team"
                className="btn btn-onboarding btn-onboarding-inverse"
              >
                Find Your Team
              </Link>
              <div className="get-started-link-description">
                Join or sign in to an existing team
              </div>
            </div>
          </div>
        </AuthenticationPage>
      </div>
    );
  }
}
