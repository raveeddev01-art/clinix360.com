import React, { Component } from "react";
import { inject } from "mobx-react";
import { withRouter, Switch, Route, Redirect } from "react-router-dom";

import Email from "./email";
import Confirmation from "./confirmation";
import TeamName from "./team_name";
import TeamUrl from "./team_url";
import FirstName from "./first_name";
import LastName from "./last_name";
import PhoneNumber from "./phone_number";
import Username from "./username";
import Password from "./password";
import Pin from "./pin";
import Invites from "./invites";
import Hipaa from "./hipaa";
import AppDownload from "./app_download";

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
        <Route exact path="/signup/team-name" component={TeamName} />
        <Route exact path="/signup/team-url" component={TeamUrl} />
        <Route exact path="/signup/first-name" component={FirstName} />
        <Route exact path="/signup/last-name" component={LastName} />
        <Route exact path="/signup/phone-number" component={PhoneNumber} />
        <Route exact path="/signup/username" component={Username} />
        <Route exact path="/signup/password" component={Password} />
        <Route exact path="/signup/pin" component={Pin} />
        <Route exact path="/signup/invites" component={Invites} />
        <Route exact path="/signup/hipaa" component={Hipaa} />
        <Route exact path="/signup/app-download" component={AppDownload} />

        <Route component={() => <Redirect to="/signup/email" />} />
      </Switch>
    );
  }
}

export default withRouter(Registration);
