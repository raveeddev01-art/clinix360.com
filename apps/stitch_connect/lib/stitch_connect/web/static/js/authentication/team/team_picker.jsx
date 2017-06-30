import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class TeamPicker extends Component {
  constructor(props) {
    super();
    this.state = {
      team_name: "",
      error: false
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      error: false
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    post("/api/v1/teams/exists", {
      body: { name: this.state.team_name }
    }).then(response => {
      this.setState({ error: !response.data.exists });
      if (response.data.exists) {
        window.location.assign(
          `https://${this.state.team_name}.localhost:4443`
        );
      }
    });
    // to="/"
  };

  render() {
    return (
      <div className="authentication-card team-card text-center">
        <h2>Sign In</h2>

        <h5>
          Enter your team's <strong>Stitch URL</strong>.
        </h5>

        <form onSubmit={this.handleSubmit} className="m-b-40">
          <FormGroup bsSize="large">
            <FormControl
              name="team_name"
              required
              autoFocus
              type="text"
              placeholder="my-team-name"
              value={this.state.team_name}
              onChange={this.handleChange}
              className="text-right"
            />
            <span className="domain">.teamstitch.com</span>
          </FormGroup>

          {this.state.error &&
            <HelpBlock className="m-b-20">This team doesn't exist.</HelpBlock>}

          <input
            value="Continue"
            type="submit"
            className="btn btn-block btn-lg btn-primary"
          />
        </form>

        <h5>
          Don't know your team's URL?{" "}
          <Link to="/signup/app-download">
            <strong>Find your team</strong>
          </Link>
        </h5>
      </div>
    );
  }
}
