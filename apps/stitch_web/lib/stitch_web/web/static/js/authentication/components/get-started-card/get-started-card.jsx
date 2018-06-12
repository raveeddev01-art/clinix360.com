import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";

import Button from "react-bootstrap/lib/Button";
import { AuthenticationPage } from "common/components";
import OrLine from "../or-line/or-line";

const TeamLink = ({ name, slug }) => (
  <div className="select-team-item">
    <div className="select-team-item-name">{name}</div>
    <div className="select-team-item-link-holder">
      <Button
        key={slug}
        href={`https://${slug}.${applicationHost}/`}
        bsStyle="primary"
      >
        Launch
      </Button>
    </div>
  </div>
);

const YourTeams = ({ teams }) => (
  <div>
    <h1>Your Carespaces</h1>
    <p>{"You are a member of these Stitch carespaces:"}</p>
    <div className="select-team-list m-b-40">
      {teams.map(team => <TeamLink key={team.slug} {...team} />)}
    </div>
    <p>
      If you are looking for a different carespace, you can try a{" "}
      <Link to="/find-your-team"> different email address</Link> or request an
      invitation from your carespace administrator.
    </p>
  </div>
);

export default class GetStartedCard extends Component {
  render() {
    return (
      <div>
        <AuthenticationPage
          title="Get Started"
          description={
            <span>
              A Stitch carespace is a group of people using Stitch together for
              team communication, patient communication, patient management, and
              more.
              <br />
              <br />
              Are you looking to join an existing carespace or create a new one?
            </span>
          }
          headerCTA="signin"
        >
          <div className="get-started-card">
            <div className="get-started-card-link-wrapper">
              <Link
                to="/signup/email"
                className="btn btn-onboarding btn-onboarding-primary"
              >
                Create a New Carespace
              </Link>
              <div className="get-started-card-link-description">
                Set up your carespace on Stitch
              </div>
            </div>
            <OrLine />
            <div className="get-started-card-link-wrapper">
              <Link
                to="/find-your-team"
                className="btn btn-onboarding btn-onboarding-inverse"
              >
                Find Your Carespace
              </Link>
              <div className="get-started-card-link-description">
                Join or sign in to an existing carespace
              </div>
            </div>
          </div>
          {appSettings.hasLogin && (
            <YourTeams teams={appSettings.teams} />
          )}
        </AuthenticationPage>
      </div>
    );
  }
}
