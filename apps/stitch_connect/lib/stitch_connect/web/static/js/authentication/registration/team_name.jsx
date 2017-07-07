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
    this.state = {
      team_name: "",
      formValid: false
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      formValid: value.length > 0
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    store.instance.teamName = this.state.team_name;
    this.props.history.push("/signup/team-url");
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

          <input
            disabled={!this.state.formValid}
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
