import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class TeamName extends Component {
  constructor(props) {
    super();
    this.state = {
      error: false,
      team_name: ""
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    // post("/api/v1/users/create", {
    //   body: { team_name: this.state.team_name }
    // }).then(response => {
    //   console.log(response);
    //   console.log("Created");
    // });
    // to="/signup/full-name"
  };

  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Team Name</h2>

        <h5>
          Enter your <strong>team name</strong>.
        </h5>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              name="team_name"
              required
              autoFocus
              type="text"
              placeholder="Ex. Care Clinic"
              value={this.state.team_name}
              onChange={this.handleChange}
            />
          </FormGroup>

          <HelpBlock>
            This is the name of your team.
            <br />
            It will show up in menus and headings.
          </HelpBlock>

          {this.state.error &&
            <HelpBlock>
              This team name is taken. Please choose another one.
            </HelpBlock>}

          <input
            value="Next"
            type="submit"
            className="btn btn-block btn-primary"
          />
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
