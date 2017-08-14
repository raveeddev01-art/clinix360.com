import React, { Component } from "react";
import { observer } from "mobx-react";
import store from "../authentication_store";
import PinCard from "../components/pin-card/pin-card";

@observer
export default class Pin extends Component {
  _onSubmit = value => {
    store.instance.pin = value;
    this.props.history.push("/signup/hipaa");
  };

  render() {
    return (
      <PinCard
        backUrl="/signup/password"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
