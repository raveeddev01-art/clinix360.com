import React, { Component } from "react";
import { inject } from "mobx-react";
import { Link } from "react-router-dom";

import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { AuthenticationPage } from "common/components";

@inject("titleStore")
export default class TeamPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamUrl: "",
      showAlert: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
  }

  onChange = event => {
    const teamUrl = event.target.value;
    this.setState({ teamUrl });
  };

  onSubmit = event => {
    const { teamUrl } = this.state;
    event.preventDefault();
    Promise.all([this.checkBlacklist(teamUrl), this.checkAvailability(teamUrl)])
      .then(resp => {
        if (resp[0].data.available && !resp[1].data.available) {
          window.location = `https://${teamUrl}.${applicationHost}`;
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

  get errorText() {
    return (
      <span>
        We don't have that team URL in our system. If you'd like, we can help
        you <Link to="/find-your-team">find your team</Link>.
      </span>
    );
  }

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

  render() {
    const { teamUrl, showAlert } = this.state;

    return (
      <AuthenticationPage
        title="Sign in to your team"
        headerType="create"
        errorText={showAlert && this.errorText}
        description={
          <span>
            Enter your team's <b> Stitch URL </b>
          </span>
        }
      >
        <Form onSubmit={this.onSubmit}>
          <FormGroup bsSize="large" className="team-form">
            <FormControl
              required
              autoFocus
              value={teamUrl}
              onChange={this.onChange}
              onFocus={this.moveCaretAtEnd}
              placeholder="your-team-url"
              maxLength={80}
            />
            <span className="domain">.teamstitch.com</span>
          </FormGroup>
          {/* TODO: extract the new button? */}
          <Button
            bsStyle="primary"
            bsSize="lg"
            type="submit"
            className="btn-lg btn-block"
          >
            <div className="next-button-interior">
              <div>Next</div>
              <div className="next-arrow-wrapper">
                <i className="fa fa-arrow-right" />
              </div>
            </div>
          </Button>
        </Form>

        <div className="team-picker-find-team-helper">
          Don't know your team's URL?{" "}
          <Link to="/find-your-team">
            <strong>Find your team</strong>
          </Link>
        </div>
      </AuthenticationPage>
    );
  }
}
