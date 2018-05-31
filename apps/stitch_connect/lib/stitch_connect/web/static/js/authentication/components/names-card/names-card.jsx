import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import { OnboardPage } from "common/components";
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

function isValidUsername(username) {
  if (/[^a-z0-9]/.test(username)) {
    return false;
  }

  return true;
}

const generalErrorText =
  "There was an issue setting your name. Please try again.";

class NamesCards extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      firstName: "",
      lastName: "",
      userName: "",
      firstNameError: "",
      lastNameError: "",
      usernameError: "",
      generalError: "",
      loading: false
    };
  }

  onKeyPress = e => {
    const hitEnter = e.charCode === 13 || e.keyCode === 13;

    if (hitEnter) {
      this.onNext();
    }
  };

  onChange = field => evt => {
    const val =
      field === "username"
        ? formatUsername(evt.target.value)
        : formatName(evt.target.value);

    this.setState({ [field]: val });
  };

  onNext = () => {
    const { firstName, lastName, username } = this.state;
    this.setState({
      usernameError: "",
      firstNameError: "",
      lastNameError: "",
      generalError: ""
    });

    if (!firstName) {
      this.setState({
        firstNameError: "You must provide a first name"
      });
      return;
    }

    if (!isValidUnicodeString(firstName)) {
      this.setState({
        firstNameError: "First name contains invalid characters."
      });
      return;
    }

    if (!lastName) {
      this.setState({
        lastNameError: "You must provide a last name"
      });
      return;
    }

    if (!isValidUnicodeString(lastName)) {
      this.setState({
        lastNameError: "Last name contains invalid characters."
      });

      return;
    }

    if (!username) {
      this.setState({
        usernameError: "You must provide a username"
      });
      return;
    }

    if (!isValidUsername(username)) {
      this.setState({
        usernameError:
          "The username should be lowercase and only use alphanumeric characters."
      });
      return;
    }

    get(`/api/v1/users/validate-username?username=${username}`, {
      hideNotify: true
    })
      .then(resp => {
        this.setState({ loading: false });
        if (resp.data) {
          this.props.onNext({
            firstname: firstName,
            lastname: lastName,
            username
          });
        } else {
          this.setState({
            generalError: generalErrorText,
            loading: false
          });
        }
      })
      .catch(() => {
        this.setState({
          generalError: generalErrorText,
          loading: false
        });
      });
  };

  render() {
    const {
      firstName,
      lastName,
      username,
      firstNameError,
      lastNameError,
      usernameError,
      generalError,
      loading
    } = this.state;

    return (
      <div>
        <OnboardPage
          {...this.props}
          title="What is your name?"
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
          <FormGroup bsSize="large" validationState={firstNameError && "error"}>
            <ControlLabel>First Name</ControlLabel>
            <FormControl
              required
              autoFocus
              placeholder="First Name"
              value={firstName}
              maxLength={80}
              onChange={this.onChange("firstName")}
              onKeyPress={this.onKeyPress}
            />
            {firstNameError && (
              <HelpBlock className="text-left">
                <i className="fa fa-exclamation-circle" />
                {firstNameError}
              </HelpBlock>
            )}
          </FormGroup>
          <FormGroup bsSize="large" validationState={lastNameError && "error"}>
            <ControlLabel>Last Name</ControlLabel>
            <FormControl
              required
              placeholder="Last Name"
              value={lastName}
              maxLength={80}
              onChange={this.onChange("lastName")}
              onKeyPress={this.onKeyPress}
            />
            {lastNameError && (
              <HelpBlock className="text-left">
                <i className="fa fa-exclamation-circle" />
                {lastNameError}
              </HelpBlock>
            )}
          </FormGroup>
          <FormGroup
            bsSize="large"
            validationState={(usernameError || generalError) && "error"}
          >
            <ControlLabel>Username</ControlLabel>
            <FormControl
              required
              placeholder="username"
              value={username}
              onChange={this.onChange("username")}
              maxLength={20}
              onKeyPress={this.onKeyPress}
            />
            {(usernameError || generalError) && (
                <HelpBlock className="text-left">
                  <i className="fa fa-exclamation-circle" />
                  {usernameError || generalError}
                </HelpBlock>
              )}
          </FormGroup>
          <HelpBlock className="onboarding-hint m-b-20">
            Usernames must be lowercase and contian only letters, numbers,
            periods, hyphens, and underscores.
          </HelpBlock>
        </OnboardPage>
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
