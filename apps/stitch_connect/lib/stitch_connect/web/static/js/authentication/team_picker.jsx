import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class TeamPicker extends Component {
  constructor(props) {
    super();
    this.state = {
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
    // event.preventDefault();
    // post("/api/v1/users/create", {
    //   body: { team_name: this.state.team_name }
    // }).then(response => {
    //   console.log(response);
    //   console.log("Created");
    // });
    // to="/"
  };

  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Team Picker Component</h2>

        <h4>
          Communicate
        </h4>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              name="team_name"
              required
              autoFocus
              type="text"
              placeholder="team_name"
              value={this.state.team_name}
              onChange={this.handleChange}
            />
          </FormGroup>

          <input
            value="Continue"
            type="submit"
            className="btn btn-block btn-primary"
          />
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
