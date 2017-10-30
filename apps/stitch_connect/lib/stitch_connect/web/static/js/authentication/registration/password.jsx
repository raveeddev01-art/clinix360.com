import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import PasswordCard from "../components/password-card/password-card";

@inject("registrationStore")
@observer
export default class Password extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.password = value;
    history.push("/signup/pin");
  };

  render() {
    const { registrationStore } = this.props;

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
