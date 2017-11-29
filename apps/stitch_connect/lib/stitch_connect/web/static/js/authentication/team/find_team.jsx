import React, { Component } from "react";
import { inject } from "mobx-react";

import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import { Card } from "common/components";

@inject("titleStore")
export default class FindTeam extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      email: "",
      sent: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Find Team");
  }

  _onChange = event => {
    this.setState({ email: event.target.value });
  };

  _onSubmit = event => {
    event.preventDefault();
    post("/api/v1/find-your-team", {
      body: { email: this.state.email },
      hideNotify: true
    }).then(() => {
      this.setState({ sent: true });
    });
  };

  render() {
    const { email, sent } = this.state;
    return !sent ? (
      <Card
        title="Find Your Team"
        description={
          <span>
            Enter your email address and we'll send you links to your existing
            teams.
          </span>
        }
      >
        <Form onSubmit={this._onSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              required
              autoFocus
              type="email"
              placeholder="Email"
              value={email}
              onChange={this._onChange}
            />
          </FormGroup>
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
          >
            Submit
          </Button>
        </Form>

        <h5>
          Just getting started?{" "}
          <a href={`https://${applicationHost}/signup/email`}>
            <strong>Create a new team</strong>
          </a>
        </h5>
      </Card>
    ) : (
      <Card
        title="Check Your Email"
        className="wide"
        description={
          <span>
            We sent an email to <strong>{email}</strong> if we found your
            account in our system. This email will link you to a page where you
            can access all of your Stitch teams.
          </span>
        }
      >
        <hr />
        <h5>
          Just getting started?{" "}
          <a href={`https://${applicationHost}/signup/email`}>
            <strong>Create a new team</strong>
          </a>
        </h5>
      </Card>
    );
  }
}
