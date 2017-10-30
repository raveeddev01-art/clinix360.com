import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import UsernameCard from "../components/username-card/username-card";

@inject("registrationStore")
@observer
export default class Username extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.username = value;
    history.push("/signup/password");
  };

  render() {
    const { registrationStore } = this.props;

    return (
      <UsernameCard
        value={registrationStore.username}
        backUrl="/signup/last-name"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
