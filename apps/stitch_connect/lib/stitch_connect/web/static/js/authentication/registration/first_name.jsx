import React, { Component } from "react";
import { observer } from "mobx-react";
import store from "../authentication_store";
import FirstNameCard from "../components/first-name-card/first-name-card";

@observer
export default class FirstName extends Component {
  _onSubmit = value => {
    store.instance.firstName = value;
    this.props.history.push("/signup/last-name");
  };

  render() {
    return (
      <FirstNameCard
        backUrl="/signup/team-url"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
