import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import PasswordCard from "../components/password-card/password-card";

@observer
@inject("registrationStore")
export default class Password extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.password = value;
    history.push("/signup/pin");
  };

  render() {
    return (
      <PasswordCard
        value={registrationStore.password}
        backUrl="/signup/username"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
