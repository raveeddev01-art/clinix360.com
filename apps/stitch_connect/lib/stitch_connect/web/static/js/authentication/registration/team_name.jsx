import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import store from "../authentication_store.js";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@observer
export default class TeamName extends Component {
  constructor(props) {
    super();
    store.instance = {};
    this.state = {
      nameAvailable: false,
      team_name: ""
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      nameAvailable: false
    });

    delay(() => {
      this.checkAvailability(value);
    }, 300);
  };

  checkAvailability = name => {
    post("/api/v1/teams/availability", {
      body: { name: name }
    }).then(response => {
      this.setState({ nameAvailable: response.data.available });
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    store.instance.teamName = this.state.team_name;
    this.props.history.push("/signup/full-name");
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

          <HelpBlock className="m-b-20">
            This is the name of your team.
            <br />
            It will show up in menus and headings.
          </HelpBlock>

          {this.state.team_name.length > 0 &&
            !this.state.nameAvailable &&
            <HelpBlock className="m-b-20">
              This team name is taken. Please choose another one.
            </HelpBlock>}

          <input
            disabled={!this.state.nameAvailable}
            value="Next"
            type="submit"
            className="btn btn-block btn-lg btn-primary m-b-40"
          />
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
