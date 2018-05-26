import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";

// import Button from "react-bootstrap/lib/Button";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { OnboardCard } from "common/components";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

@inject("titleStore")
@observer
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

    return (
      <div>
        <Header />
        <div className="authentication-main">
          {!sent ? (
            <OnboardCard
              title="Find Your Team"
              description={
                <span>
                  We’ll send you an email to confirm your address and find
                  existing teams you’ve joined or can join.
                </span>
              }
              onNext={this._onSubmit}
            >
              <ControlLabel>Email</ControlLabel>
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
            </OnboardCard>
          ) : (
            <OnboardCard
              title="Check your email!"
              className="wide"
              description={
                <span>
                  We've emailed a confirmation link to {email}. Click the link
                  to confirm your address and get started. <br /> <br />Wrong
                  email?{" "}
                  <a href="/find-your-team">Please re-enter your address. </a>
                </span>
              }
              hideFooter
            />
          )}
        </div>
      </div>
    );
  }
}
