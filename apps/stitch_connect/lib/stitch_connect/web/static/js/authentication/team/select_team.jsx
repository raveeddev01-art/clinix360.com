import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import { Card } from "common/components";
import FindTeam from "./find_team";

export default class SelectTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenFound: true,
      teams: []
    };
  }

  componentWillMount() {
    const token = this.props.match.params.token;

    window
      .remove(`/api/v1/find-your-team/${token}`)
      .then(response => this.setState({ teams: response.data.teams }))
      .catch(() => this.setState({ tokenFound: false }));
  }

  renderTeamLink(team) {
    return (
      <div className="select-team-item">
        <div className="select-team-item-name">{team.name}</div>
        <div className="select-team-item-link-holder">
          <Button
            key={team.slug}
            href={`https://${team.slug}.${applicationHost}/find-your-team/${team.login_token}/login`}
            bsStyle="primary"
          >
            Launch
          </Button>
        </div>
      </div>
    );
  }

  render() {
    if (!this.state.tokenFound) {
      return <FindTeam />;
    }

    return (
      <Card
        title="Your Teams"
        headerType="no-cta"
        description={<span>You’re a member of of these Stitch teams:</span>}
      >
        <div className="select-team-list m-b-40">
          {this.state.teams.map(this.renderTeamLink)}
        </div>
        <HelpBlock className="onboarding-hint m-b-20">
          If you are looking for a different team, you can{" "}
          <a href="/find-your-team">try a different email address</a> or request
          an invitation from your Team Administrator.
        </HelpBlock>
      </Card>
    );
  }
}
