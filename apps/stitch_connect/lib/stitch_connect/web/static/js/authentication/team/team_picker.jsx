import React, { Component } from "react";
import { Link } from "react-router-dom";

import Alert from "react-bootstrap/lib/Alert";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class TeamPicker extends Component {
  constructor(props) {
    super();
    this.state = {
      team_name: "",
      teamExists: false
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    delay(() => {
      this.checkAvailability(value);
    }, 300);
  };

  checkAvailability = name => {
    post("/api/v1/teams/availability", {
      body: { name: name }
    }).then(response => {
      this.setState({ teamExists: !response.data.available });
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    window.location = `https://${this.state.team_name}.localhost:4443`;
  };

  render() {
    return (
      <div>
        {this.state.error && <Alert>This team doesn't seem to exist.</Alert>}

        <div className="authentication-card text-center">
          <div className="card-header">
            <Row>
              <Col xs={12} className="text-right">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Close</Tooltip>}
                >
                  <Link to="/">
                    <i className="fa fa-times" />
                  </Link>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>

          <h2>Sign In</h2>

          <h5>
            Enter your team's <strong>Stitch URL</strong>.
          </h5>

          <form onSubmit={this.handleSubmit} className="m-b-40">
            <FormGroup bsSize="large" className="team-form">
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

            <input
              disabled={!this.state.teamExists}
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
      </div>
    );
  }
}
