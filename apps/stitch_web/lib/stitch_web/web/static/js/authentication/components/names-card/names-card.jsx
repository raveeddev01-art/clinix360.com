import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";

import { OnboardPage, InputErrorBlock } from "common/components";

import { isValidUnicodeString } from "lib/utils";
import { mobile } from "../../../lib/browser_details";

function formatUsername(givenUsername) {
  // letters, numbers, periods, hyphens, and underscores
  return givenUsername.replace(/[^0-9a-zA-Z|\-|_|.]/g, "").toLowerCase();
}

function formatName(givenUsername) {
  // get rid of emoji-esque characters (pictographs)
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
      username: "",
      firstNameError: "",
      lastNameError: "",
      usernameError: "",
      generalError: "",
      loading: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  onKeyPress = (e) => {
    const hitEnter = e.charCode === 13 || e.keyCode === 13;

    if (hitEnter) {
      this.onNext();
    }
  };

  onChange = (field) => (evt) => {
    const val =
      field === "username"
        ? formatUsername(evt.target.value)
        : formatName(evt.target.value);

    this.setState({ [field]: val });
  };

  onPatientNext = () => {
    const { firstName, lastName } = this.state;
    this.resetErrors();
    if (this.checkForAndSetError()) {
      // short circuit if error gets set
      return;
    }

    this.props.onNext({ firstname: firstName, lastname: lastName });
  };

  onNext = () => {
    const { firstName, lastName, username } = this.state;

    // clear any existing errors
    this.resetErrors();
    if (this.checkForAndSetError()) {
      // short circuit if error gets set
      return;
    }

    get(`/api/v1/users/validate-username?username=${username}`, {
      hideNotify: true,
    })
      .then((resp) => {
        this.setState({ loading: false });
        if (resp.data) {
          this.props.onNext({
            firstname: firstName,
            lastname: lastName,
            username,
          });
        } else {
          this.setState({
            generalError: generalErrorText,
            loading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          generalError: generalErrorText,
          loading: false,
        });
      });
  };

  resetErrors = () => {
    this.setState({
      usernameError: "",
      firstNameError: "",
      lastNameError: "",
      generalError: "",
    });
  };

  checkForAndSetError = () => {
    const { firstName, lastName, username } = this.state;

    if (!firstName) {
      this.setState({
        firstNameError: "You must provide a first name",
      });
      return true;
    }

    if (!isValidUnicodeString(firstName)) {
      this.setState({
        firstNameError: "First name contains invalid characters.",
      });
      return true;
    }

    if (!lastName) {
      this.setState({
        lastNameError: "You must provide a last name",
      });
      return true;
    }

    if (!isValidUnicodeString(lastName)) {
      this.setState({
        lastNameError: "Last name contains invalid characters.",
      });

      return true;
    }

    // dont check username if patient
    // (since not setting username)
    if (this.props.asPatient) {
      return false;
    }

    if (!username) {
      this.setState({
        usernameError: "You must provide a username",
      });
      return true;
    }

    if (!isValidUsername(username)) {
      this.setState({
        usernameError:
          "The username should be lowercase and only use alphanumeric characters.",
      });
      return true;
    }
  };

  renderUserName() {
    const { username, usernameError, generalError } = this.state;
    return (
      <div>
        <FormGroup
          bsSize="large"
          validationState={((usernameError || generalError) && "error") || null}
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
            <InputErrorBlock>{usernameError || generalError}</InputErrorBlock>
          )}
        </FormGroup>
        <HelpBlock className="onboarding-hint m-b-20">
          Usernames must be lowercase and contian only letters, numbers,
          periods, hyphens, and underscores.
        </HelpBlock>
      </div>
    );
  }

  render() {
    const {
      firstName,
      lastName,
      username,
      firstNameError,
      lastNameError,
      loading,
    } = this.state;
    const { asPatient } = this.props;

    const description = asPatient
      ? ""
      : "Your name will appear alongside your messages, files, tasks, and more in InvoCom.";

    const disableNext = !firstName || !lastName || (!asPatient && !username);
    const nextCb = asPatient ? this.onPatientNext : this.onNext;

    return (
      <div>
        <OnboardPage
          {...this.props}
          title="What is your name?"
          description={description}
          disableNext={disableNext}
          loading={loading}
          onNext={nextCb}
        >
          <FormGroup
            bsSize="large"
            validationState={(firstNameError && "error") || null}
          >
            <ControlLabel>First Name</ControlLabel>
            <FormControl
              required
              autoFocus={!mobile}
              placeholder="First Name"
              value={firstName}
              maxLength={80}
              onChange={this.onChange("firstName")}
              onKeyPress={this.onKeyPress}
            />
            {firstNameError && (
              <InputErrorBlock>{firstNameError}</InputErrorBlock>
            )}
          </FormGroup>
          <FormGroup
            bsSize="large"
            validationState={(lastNameError && "error") || null}
          >
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
              <InputErrorBlock>{lastNameError}</InputErrorBlock>
            )}
          </FormGroup>
          {!asPatient && this.renderUserName()}
        </OnboardPage>
      </div>
    );
  }
}

NamesCards.defaultProps = {
  asPatient: false,
};

NamesCards.propTypes = {
  asPatient: PropTypes.bool,
  onNext: PropTypes.func.isRequired,
};

export default NamesCards;
