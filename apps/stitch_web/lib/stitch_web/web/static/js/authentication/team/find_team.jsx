import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import { Link } from "react-router-dom";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

import { OnboardPage } from "common/components";
import { mobile } from "../../lib/browser_details";

@inject("titleStore")
@observer
class FindTeam extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      email: "",
      sent: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Find Workspace");
  }

  _onChange = event => {
    this.setState({ email: event.target.value });
  };

  _onSubmit = event => {
    event.preventDefault();

    const url = this.props.asPatient
      ? "/api/v1/patient/find-your-team"
      : "/api/v1/find-your-team";

    post(url, {
      body: { email: this.state.email },
      hideNotify: true
    }).then(() => {
      this.setState({ sent: true });
    });
  };

  renderFindTeam() {
    const { email } = this.state;

    const singinUrl = this.props.asPatient ? "/patient/signin" : "/signin";

    return (
      <OnboardPage
        title="Find Your Workspace"
        headerCTA="signin"
        description={
          <span>
            We’ll send you an email to confirm your address and find existing
            Workspaces you’ve joined or can join.
          </span>
        }
        onNext={this._onSubmit}
      >
        <link rel="canonical" href="https://invo.chat/find-your-team/"/>
        <meta name="title" content="Find your team - Invochat Workspace"></meta>
        <meta name="description" content="Find Your Team - Discover and connect with like-minded individuals to build a strong, collaborative team for your projects and goals."></meta>
        <meta name="robots" content="index, follow"></meta>
        <ControlLabel>Email</ControlLabel>
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus={!mobile}
            type="email"
            placeholder="Email"
            value={email}
            onChange={this._onChange}
          />
        </FormGroup>
        <div className="team-picker-find-team-helper">
          Know your Workspace URL?{" "}
          <Link to={singinUrl}>
            <strong>Sign In</strong>
          </Link>
        </div>
      </OnboardPage>
    );
  }

  renderCheckEmail() {
    const { email } = this.state;
    const findTeamLink = this.props.asPatient
      ? "/patient/find-your-team"
      : "/find-your-team";

    return (
      <OnboardPage
        title="Check your email!"
        headerCTA="signin"
        description={
          <span>
            We sent an email to {email} if we found your account in our system.
            This email will give you a link to find your workspace. <br /> <br />Wrong email?{" "}
            <a href={findTeamLink}>Please re-enter your address. </a>
          </span>
        }
        hideFooter
      />
    );
  }

  render() {
    return !this.state.sent ? this.renderFindTeam() : this.renderCheckEmail();
  }
}

FindTeam.defaultProps = {
  asPatient: false
};

FindTeam.propTypes = {
  asPatient: PropTypes.bool
};

export default FindTeam;
