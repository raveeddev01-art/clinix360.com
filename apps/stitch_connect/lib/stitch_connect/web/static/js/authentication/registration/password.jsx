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
    return (
      <PasswordCard
        value=""
        backUrl="/signup/username"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
