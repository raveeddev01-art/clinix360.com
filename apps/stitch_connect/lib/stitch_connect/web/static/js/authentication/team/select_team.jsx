import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";
import FindTeam from "./find_team";

import Card from "../components/card/card";

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

  render() {
    if (!this.state.tokenFound) {
      return <FindTeam />;
    }

    return (
      <Card
        title="Select Team"
        description={<span>Select one of your teams:</span>}
      >
        <div className="m-b-40">
          {this.state.teams.map(team => {
            return (
              <Button
                key={team.slug}
                href={`https://${team.slug}.${applicationHost}/login`}
                bsSize="large"
                block
              >
                {team.name}
              </Button>
            );
          })}
        </div>
      </Card>
    );
  }
}
