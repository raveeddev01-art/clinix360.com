import React, { Component } from "react";
import { inject } from "mobx-react";
import { withRouter, Switch, Route, Redirect } from "react-router-dom";

import Email from "./email";
import Confirmation from "./confirmation";
import Onboarding from "./onboarding";

@inject("titleStore")
class Registration extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Sign Up");
  }

  render() {
    return (
      <Switch>
        <Route exact path="/signup/email" component={Email} />
        <Route
          exact
          path="/signup/confirmation-code"
          component={Confirmation}
        />

        <Route
          exact
          path="/signup/onboarding/:currentStep"
          component={Onboarding}
        />

        <Route component={() => <Redirect to="/signup/email" />} />
      </Switch>
    );
  }
}

export default withRouter(Registration);
