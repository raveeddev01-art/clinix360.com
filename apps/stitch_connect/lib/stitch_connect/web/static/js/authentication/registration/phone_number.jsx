import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import PhoneNumberCard from "../components/phone-number-card/phone-number-card";

@observer
@inject("registrationStore")
class PhoneNumber extends Component {
  _onSubmit = value => {
    const { registrationStore, history } = this.props;

    registrationStore.phone = value;
    history.push("/signup/username");
  };

  render() {
    const { registrationStore } = this.props;

    return (
      <PhoneNumberCard
        value={registrationStore.phone}
        backUrl="/signup/last-name"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}

export default PhoneNumber;
