import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Button from "react-bootstrap/lib/Button";
import { AuthenticationPage } from "common/components";
import OrLine from "../or-line/or-line";

const TeamLink = ({ asPatient, name, slug }) => {
  const path = asPatient ? "patient" : "";

  return (
    <div className="select-team-item">
      <div className="select-team-item-name">{name}</div>
      <div className="select-team-item-link-holder">
        <Button
          key={slug}
          href={`https://${slug}.${applicationHost}/${path}`}
          bsStyle="primary"
        >
          Launch
        </Button>
      </div>
    </div>
  );
};

const YourTeams = ({ asPatient, teams }) => {
  const findTeamLink = asPatient
    ? "/patient/find-your-team"
    : "/find-your-team";

  const userType = asPatient ? "patient in" : "member of";

  return (
    <div>
      <h1>Your Workspaces</h1>
      <p>{`You are a ${userType} these InvoChat workspaces:`}</p>
      <div className="select-team-list m-b-40">
        {teams.map(team => (
          <TeamLink asPatient={asPatient} key={team.slug} {...team} />
        ))}
      </div>
      <p>
        If you are looking for a different workspace, you can try a{" "}
        <Link to={findTeamLink}> different email address</Link>
        {asPatient
          ? "."
          : " or request an invitation from your workspace administrator."}
      </p>
    </div>
  );
};

class GetStartedCard extends Component {
  renderYourTeams() {
    if (this.props.asPatient) {
      return (
        window.appSettings.hasPatientLogin && (
          <YourTeams asPatient teams={window.appSettings.patientTeams} />
        )
      );
    }

    return (
      window.appSettings.hasLogin && (
        <YourTeams teams={window.appSettings.teams} />
      )
    );
  }

  render() {
    const { asPatient } = this.props;
    const showSignup = !asPatient;
    const findTeamLink = asPatient
      ? "/patient/find-your-team"
      : "/find-your-team";

    return (
      <div>
        <AuthenticationPage
          title="Get Started"
          description={
            <span>
              A InvoChat Workspace is a place for InvoChat teams to

              collaborate in real-time through messaging, file sharing, video
              calling and more.
              <br />
              <br />
              Are you looking to join an existing Workspace or create a new one?
            </span>
          }
          headerCTA="signin"
        >
          <div className="get-started-card">
            {showSignup && (
              <div className="get-started-card-link-wrapper">
                <Link
                  to="/signup/email"
                  className="btn btn-onboarding btn-onboarding-primary"
                >
                  Create a New Workspace
                </Link>
                <div className="get-started-card-link-description">
                  Set up your Workspace on InvoChat
                </div>
              </div>
            )}
            {showSignup && <OrLine />}
            <div className="get-started-card-link-wrapper">
              <Link
                to={findTeamLink}
                className="btn btn-onboarding btn-onboarding-inverse"
              >
                Find Your Workspace
              </Link>
              <div className="get-started-card-link-description">
                Join or sign in to an existing Workspace
              </div>
            </div>
          </div>
          {this.renderYourTeams()}
        </AuthenticationPage>
      </div>
    );
  }
}

GetStartedCard.defaultProps = {
  asPatient: false
};

GetStartedCard.propTypes = {
  asPatient: PropTypes.bool
};

export default GetStartedCard;
