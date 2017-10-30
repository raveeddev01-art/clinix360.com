import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import LastNameCard from "../components/last-name-card/last-name-card";

@observer
@inject("registrationStore")
export default class LastName extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.lastName = value;
    history.push("/signup/username");
  };

  render() {
    const { registrationStore } = this.props;

    return (
      <LastNameCard
        value={registrationStore.lastName}
        backUrl="/signup/first-name"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
