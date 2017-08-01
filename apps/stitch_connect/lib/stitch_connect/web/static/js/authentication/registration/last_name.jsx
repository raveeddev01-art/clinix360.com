import React, { Component } from "react";
import { observer } from "mobx-react";
import store from "../authentication_store.js";
import LastNameCard from "../components/last-name-card/last-name-card.jsx";

@observer
export default class LastName extends Component {
  _onSubmit = value => {
    store.instance.lastName = value;
    this.props.history.push("/signup/phone-number");
  };

  render() {
    return (
      <LastNameCard
        backUrl="/signup/first-name"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
