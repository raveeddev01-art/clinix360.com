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
    this.props.titleStore.setPageName("Find Carespace");
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
        title="Find Your Carespace"
        headerCTA="signin"
        description={
          <span>
            We’ll send you an email to confirm your address and find existing
            Carespaces you’ve joined or can join.
          </span>
        }
        onNext={this._onSubmit}
      >
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
          Know your Carespace URL?{" "}
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
            We've emailed a confirmation link to {email}. Click the link to
            confirm your address and get started. <br /> <br />Wrong email?{" "}
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
