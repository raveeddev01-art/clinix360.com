import React, { Component } from "react";
import { inject } from "mobx-react";
import { Link } from "react-router-dom";

import Alert from "react-bootstrap/lib/Alert";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

@inject("titleStore")
export default class TeamPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      team_name: "",
      teamExists: undefined,
      isLoading: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  checkAvailability = name => {
    this.setState({ isLoading: true });
    post("/api/v1/teams/url-available", {
      body: { url: name }
    }).then(response => {
      this.setState({ teamExists: !response.data.available, isLoading: false });
      if (this.state.teamExists === true) {
        window.location = `https://${this.state.team_name}.${applicationHost}`;
      }
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.checkAvailability(this.state.team_name);
  };

  render() {
    return (
      <div>
        {this.state.teamExists === false && (
          <Alert>This team doesn't seem to exist.</Alert>
        )}

        <div className="authentication-card text-center team-picker-card">
          <div className="card-header">
            <Row>
              <Col xs={12} className="text-right">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="close">Close</Tooltip>}
                >
                  <Link to="/getstarted">
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
              disabled={this.state.isLoading || this.state.team_name === ""}
              value="Continue"
              type="submit"
              className="btn btn-block btn-lg btn-primary"
            />
          </form>

          <h5>
            Don't know your team's URL?{" "}
            <Link to="/find-teams">
              <strong>Find your team</strong>
            </Link>
          </h5>
        </div>
      </div>
    );
  }
}
