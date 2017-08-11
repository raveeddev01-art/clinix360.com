import React, { Component } from "react";
import { observer } from "mobx-react";
import store from "../authentication_store";

import PasswordCard from "../components/password-card/password-card";

@observer
export default class Password extends Component {
  _onSubmit = value => {
    store.instance.password = value;
    this.props.history.push("/signup/pin");
  };

  render() {
    return (
      <PasswordCard
        backUrl="/signup/username"
        restartUrl="/signup/team-name"
        onNext={this._onSubmit}
      />
    );
  }
}
