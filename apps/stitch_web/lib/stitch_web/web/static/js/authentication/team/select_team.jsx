import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import { AuthenticationPage } from "common/components";
import FindTeam from "./find_team";

class SelectTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenFound: true,
      teams: [],
    };
  }

  componentWillMount() {
    const token = this.props.match.params.token;
    const removeUrl = this.props.asPatient
      ? `/api/v1/patient/find-your-team/${token}`
      : `/api/v1/find-your-team/${token}`;

    window
      .remove(removeUrl)
      .then((response) => this.setState({ teams: response.data.teams }))
      .catch(() => this.setState({ tokenFound: false }));
  }

  renderTeamLink = (team) => {
    const loginUrl = this.props.asPatient
      ? `https://${team.slug}.${applicationHost}/patient/find-your-team/${team.login_token}/login`
      : `https://${team.slug}.${applicationHost}/find-your-team/${team.login_token}/login`;
    return (
      <div className="select-team-item">
        <div className="select-team-item-name">{team.name}</div>
        <div className="select-team-item-link-holder">
          <Button key={team.slug} href={loginUrl} bsStyle="primary">
            Launch
          </Button>
        </div>
      </div>
    );
  };

  render() {
    if (!this.state.tokenFound) {
      return <FindTeam asPatient={this.props.asPatient} />;
    }

    return (
      <AuthenticationPage
        title="Your Carespaces"
        headerCTA="no-cta"
        description="You are a member of of these  carespaces:"
      >
        <div className="select-team-list m-b-40">
          {this.state.teams.map(this.renderTeamLink)}
        </div>
        <HelpBlock className="onboarding-hint m-b-20">
          If you are looking for a different carespace, you can{" "}
          <a href="/find-your-team">try a different email address</a> or request
          an invitation from your Carespace Administrator.
        </HelpBlock>
      </AuthenticationPage>
    );
  }
}

SelectTeam.defaultProps = {
  asPatient: false,
};

SelectTeam.propTypes = {
  asPatient: PropTypes.bool,
};

export default SelectTeam;
