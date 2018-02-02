import React, { Component } from "react";
import { inject } from "mobx-react";
import { Link } from "react-router-dom";

import Alert from "react-bootstrap/lib/Alert";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

@inject("titleStore")
export default class TeamPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamName: "",
      showAlert: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
  }

  handleChange = event => {
    const teamName = event.target.value;
    this.setState({ teamName });
  };

  checkBlacklist = url => {
    return post("/api/v1/teams/slug-exists", {
      body: { url }
    });
  };

  checkAvailability = name => {
    return post("/api/v1/teams/url-available", {
      body: { url: name }
    });
  };

  handleSubmit = event => {
    const { teamName } = this.state;
    event.preventDefault();
    Promise.all([
      this.checkBlacklist(teamName),
      this.checkAvailability(teamName)
    ])
      .then(resp => {
        if (resp[0].data.available && !resp[1].data.available) {
          window.location = `https://${teamName}.${applicationHost}`;
        } else {
          this.setState({
            showAlert: true
          });
        }
      })
      .catch(() => {
        this.setState({ showAlert: true });
      });
  };

  render() {
    const { showAlert, teamName } = this.state;

    return (
      <div>
        {showAlert && (
          <Alert bsStyle="danger">
            We don't have that team URL in our system. If you'd like, we can
            help you <Link to="/find-your-team">find your team</Link>.
          </Alert>
        )}

        <div className="authentication-card text-center team-picker-card">
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
                autoComplete="off"
                placeholder="Subdomain"
                value={teamName}
                onChange={this.handleChange}
              />
              <span className="domain">.teamstitch.com</span>
            </FormGroup>

            <Button
              bsStyle="primary"
              bsSize="lg"
              type="submit"
              className="btn-block"
            >
              Continue
            </Button>
          </form>

          <h5>
            Don't know your team's URL?{" "}
            <Link to="/find-your-team">
              <strong>Find your team</strong>
            </Link>
          </h5>
        </div>

        <h5>
          Just getting started? {" "}
          <Link to="/signup/email">
            <strong>Create a new team</strong>
          </Link>
        </h5>
      </div>
    );
  }
}
