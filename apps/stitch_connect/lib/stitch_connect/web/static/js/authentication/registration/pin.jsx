import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import PinCard from "../components/pin-card/pin-card";

@observer
@inject("registrationStore")
export default class Pin extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.pin = value;
    history.push("/signup/hipaa");
  };

  render() {
    const { registrationStore } = this.props;

    return (
      <PinCard
        value={registrationStore.pin}
        backUrl="/signup/password"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
