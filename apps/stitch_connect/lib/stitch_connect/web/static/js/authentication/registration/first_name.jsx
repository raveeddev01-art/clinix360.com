import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import FirstNameCard from "../components/first-name-card/first-name-card";

@inject("registrationStore")
@observer
export default class FirstName extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.firstName = value;
    history.push("/signup/last-name");
  };

  render() {
    const { registrationStore } = this.props;

    return (
      <FirstNameCard
        value={registrationStore.firstName}
        backUrl="/signup/team-url"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
