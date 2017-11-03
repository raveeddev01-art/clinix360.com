import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Alert from "react-bootstrap/lib/Alert";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card";

@inject("invitationStore")
@observer
class Username extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: this.props.invitationStore.username,
      invalidUsername: false
    };
  }

  _onChange = evt => {
    const username = evt.target.value.toLowerCase();
    this.setState({
      username
    });
  };

  _onSubmit = () => {
    const { onNext, invitationStore } = this.props;
    const username =
      this.state.username !== ""
        ? this.state.username
        : invitationStore.email.replace(/@.*$/, "");

    if (/^[a-z0-9][a-z0-9\.\-\-]+$/.test(username) === false) {
      this.setState({
        invalidUsername: true
      });
      return;
    }
    invitationStore.username = username;
    onNext();
  };

  render() {
    const { onBack, onRestart, invitationStore } = this.props;
    const placeholder = invitationStore.email.replace(/@.*$/, "").toLowerCase();
    const { username, invalidUsername } = this.state;
    return [
      invalidUsername && (
        <Alert key="username-invalid-alert">
          Usernames must be lowercase and without spaces, periods or
          punctuations.
        </Alert>
      ),
      <OnboardCard
        title="Username"
        key="username-card"
        description={
          <span>
            Enter a <strong>username</strong>.
          </span>
        }
        onNext={this._onSubmit}
        onBack={onBack}
        onRestart={onRestart}
      >
        <FormGroup bsSize="large">
          <FormControl
            autoFocus
            type="text"
            placeholder={placeholder || "username"}
            value={username}
            onChange={this._onChange}
          />
        </FormGroup>
        <HelpBlock className="m-b-20">
          Your username is how others will mention you. It should be unique and
          lowercase.
        </HelpBlock>
      </OnboardCard>
    ];
  }
}

Username.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default Username;
