import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import { OnboardCard } from "common/components";
import { isValidUnicodeString } from "lib/utils";

function formatUsername(givenUsername) {
  // letters, numbers, periods, hyphens, and underscores
  return givenUsername.replace(/[^0-9a-zA-Z|\-|_|.]/g, "").toLowerCase();
}

function formatName(givenUsername) {
  return givenUsername.replace(
    /[\uD83D[\uDC00-\uDDFF]|\uD83C[\uDF00-\uDFFF]|:|\\]/g,
    ""
  );
}

class NamesCards extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      firstName: "",
      lastName: "",
      userName: "",
      alertMessage: "",
      hasError: false,
      hasPatternError: false,
      loading: false
    };
  }

  onChange = field => evt => {
    const val =
      field === "username"
        ? formatUsername(evt.target.value)
        : formatName(evt.target.value);

    this.setState({ [field]: val });
  };

  onNext = () => {
    const { firstName, lastName, username } = this.state;
    this.setState({ hasPatternError: false });

    if (!this.patternValidate()) {
      return;
    }

    if (!isValidUnicodeString(firstName)) {
      this.setState({
        alertMessage: "First name contains invalid characters."
      });
      return;
    }

    if (!isValidUnicodeString(lastName)) {
      this.setState({
        alertMessage: "Last name contains invalid characters."
      });

      return;
    }

    this.setState({ loading: true });
    get(`/api/v1/users/validate-username?username=${username}`, {
      hideNotify: true
    })
      .then(resp => {
        this.setState({ loading: false });
        if (resp.data) {
          this.setState({ hasError: false });
          this.props.onNext({
            firstname: firstName,
            lastname: lastName,
            username,
            alertMessage: ""
          });
        } else {
          this.setState({ hasError: true });
        }
      })
      .catch(() => {
        this.setState({ hasError: true, loading: false });
      });
  };

  get errorText() {
    const { alertMessage, hasPatternError, hasUniquenessError } = this.state;

    if (alertMessage) {
      return alertMessage;
    }

    if (hasPatternError) {
      return "The username should be lowercase and only use alphanumeric characters.";
    }

    if (hasUniquenessError) {
      return "That username is already taken.";
    }

    return "";
  }

  patternValidate = () => {
    const { username } = this.state;

    if (/[^a-z0-9]/.test(username)) {
      // starts with letter or number
      this.setState({ hasPatternError: true });
      return false;
    }

    return true;
  };

  render() {
    const { firstName, lastName, username, alertMessage, loading } = this.state;

    return (
      <div>
        <OnboardCard
          {...this.props}
          title="What is your name?"
          errorText={alertMessage}
          description={
            <span>
              Your name will appear alongside your messages, files, tasks, and
              more in Stitch.
            </span>
          }
          disableNext={!firstName || !lastName || !username}
          loading={loading}
          onNext={this.onNext}
        >
          <FormGroup inline bsSize="large">
            <ControlLabel>Full Name</ControlLabel>
            <div className="inline-input-holder">
              <div className="inline-half-input">
                <FormControl
                  required
                  autoFocus
                  placeholder="First Name"
                  value={firstName}
                  maxLength={80}
                  onChange={this.onChange("firstName")}
                />
              </div>
              <div className="inline-half-input">
                <FormControl
                  required
                  placeholder="Last Name"
                  value={lastName}
                  maxLength={80}
                  onChange={this.onChange("lastName")}
                />
              </div>
            </div>
          </FormGroup>
          <FormGroup bsSize="large">
            <ControlLabel>Username</ControlLabel>
            <FormControl
              required
              placeholder="username"
              value={username}
              onChange={this.onChange("username")}
              maxLength={20}
            />
          </FormGroup>
          <HelpBlock className="onboarding-hint m-b-20">
            Usernames must be lowercase and contian only letters, numbers,
            periods, hyphens, and underscores.
          </HelpBlock>
        </OnboardCard>
      </div>
    );
  }
}

NamesCards.propTypes = {
  onNext: PropTypes.func.isRequired
};

NamesCards.defaultProps = {
  onNext: () => {}
};

export default NamesCards;
