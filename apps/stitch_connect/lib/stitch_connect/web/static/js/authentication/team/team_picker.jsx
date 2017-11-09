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
import debounce from "lodash/debounce";

@inject("titleStore")
export default class TeamPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamName: "",
      teamExists: undefined,
      blacklisted: true,
      isLoading: false
    };

    this.checkBlacklist = debounce(this.checkBlacklist, 500);
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
  }

  handleChange = event => {
    const teamName = event.target.value;
    this.setState({
      teamName
    });
    this.checkBlacklist(teamName);
  };

  checkBlacklist = url => {
    this.setState({ blacklisted: true });
    post("/api/v1/teams/slug-exists", {
      body: { url }
    }).then(res => {
      this.setState({ blacklisted: !res.data.available });
    });
  };

  checkAvailability = name => {
    this.setState({ isLoading: true });
    post("/api/v1/teams/url-available", {
      body: { url: name }
    }).then(response => {
      this.setState({ teamExists: !response.data.available, isLoading: false });
      if (this.state.teamExists === true) {
        window.location = `https://${this.state.teamName}.${applicationHost}`;
      }
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.checkAvailability(this.state.teamName);
  };

  render() {
    const { teamExists, teamName, isLoading, blacklisted } = this.state;

    return (
      <div>
        {teamExists === false && (
          <Alert>
            We don't have that team URL in our system. If you'd like, we can
            help you <Link to="/find-teams">find your team</Link>.
          </Alert>
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
                name="teamName"
                required
                autoFocus
                type="text"
                placeholder="Subdomain"
                value={teamName}
                onChange={this.handleChange}
              />
              <span className="domain">.teamstitch.com</span>
            </FormGroup>

            <input
              disabled={isLoading || !teamName || blacklisted}
              value="Continue"
              type="submit"
              className="btn btn-block btn-lg btn-primary"
            />
          </form>

          <h5>
            Don't know your team's URL?{" "}
            <Link to="/find-your-team">
              <strong>Find your team</strong>
            </Link>
          </h5>
        </div>

        <h5>
          Just getting started?{" "}
          <Link to="/signup/email">
            <strong>Create a new team</strong>
          </Link>
        </h5>
      </div>
    );
  }
}
