import React, { Component } from "react";
import Alert from "react-bootstrap/lib/Alert";
import { observer, inject } from "mobx-react";

import UsernameCard from "../components/username-card/username-card";

@inject("registrationStore")
@observer
export default class Username extends Component {
  constructor(props) {
    super(props);

    this.state = {
      invalidUsername: false
    };
  }

  _onSubmit = value => {
    const { registrationStore, history } = this.props;
    const username =
      value !== "" ? value : registrationStore.email.replace(/@.*$/, "");

    if (/^[a-z0-9][a-z0-9\.\-\-]+$/.test(username) === false) {
      this.setState({ invalidUsername: true });
      return;
    }

    registrationStore.username = username;
    history.push("/signup/password");
  };

  render() {
    const { registrationStore } = this.props;
    const username = registrationStore.email.replace(/@.*$/, "").toLowerCase();
    const { invalidUsername } = this.state;

    return [
      invalidUsername && (
        <Alert key="username-invalid-alert">
          Usernames must be lowercase and without spaces, periods or
          punctuations.
        </Alert>
      ),
      <UsernameCard
        key="username-card"
        value={registrationStore.username}
        backUrl="/signup/phone-number"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
        placeholder={username}
      />
    ];
  }
}
