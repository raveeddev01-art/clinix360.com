import React, { Component } from "react";
import { observer } from "mobx-react";
import store from "../authentication_store";
import PhoneNumberCard from "../components/phone-number-card/phone-number-card";

@observer
class PhoneNumber extends Component {
  _onSubmit = value => {
    store.instance.phone = value;
    this.props.history.push("/signup/username");
  };

  render() {
    return (
      <PhoneNumberCard
        backUrl="/signup/last-name"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}

export default PhoneNumber;
