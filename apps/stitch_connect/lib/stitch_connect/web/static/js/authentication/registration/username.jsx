import React, { Component } from "react";
import { observer } from "mobx-react";
import store from "../authentication_store";
import UsernameCard from "../components/username-card/username-card";

@observer
export default class Username extends Component {
  _onSubmit = value => {
    store.instance.username = value;
    this.props.history.push("/signup/password");
  };

  render() {
    return (
      <UsernameCard
        backUrl="/signup/last-name"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
