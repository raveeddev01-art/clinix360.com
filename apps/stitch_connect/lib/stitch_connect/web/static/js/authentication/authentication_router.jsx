import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "mobx-react";

import GetStarted from "./get_started";
import TeamPicker from "./team/team_picker";
import FindTeam from "./team/find_team";

import Login from "./login/login";

import Email from "./registration/email";
import Confirmation from "./registration/confirmation";
import TeamName from "./registration/team_name";
import TeamUrl from "./registration/team_url";
import FirstName from "./registration/first_name";
import LastName from "./registration/last_name";
import PhoneNumber from "./registration/phone_number";
import Username from "./registration/username";
import Password from "./registration/password";
import Pin from "./registration/pin";
import Invites from "./registration/invites";
import Hipaa from "./registration/hipaa";
import AppDownload from "./registration/app_download";

import SendEmail from "./reset-password/send-email";
import SetPassword from "./reset-password/set-password";
import resetPasswordStore from "./stores/reset_password_store";
import authenticationStore from "./authentication_store";

const stores = { resetPasswordStore, authenticationStore };
// @TODO refactor authentication_store and provide by using provider

export default class AuthenticationRouter extends Component {
  componentWillMount() {
    authenticationStore.instance = {
      teamName: this.props.teamName,
      teamSlug: this.props.teamSlug
    };
    resetPasswordStore.token = this.props.token;
    resetPasswordStore.teamId = this.props.teamId;
  }

  render() {
    return (
      <Router>
        <Provider {...stores}>
          <div className="authentication-wrapper">
            <Route exact path={`/`} component={GetStarted} />
            <Route exact path={`/signin`} component={TeamPicker} />
            <Route exact path="/find-teams" component={FindTeam} />

            <Route exact path={`/login`} component={Login} />

            <Route exact path={`/signup/email`} component={Email} />
            <Route
              exact
              path={`/signup/confirmation-code`}
              component={Confirmation}
            />
            <Route exact path={`/signup/team-name`} component={TeamName} />
            <Route exact path={`/signup/team-url`} component={TeamUrl} />
            <Route exact path={`/signup/first-name`} component={FirstName} />
            <Route exact path={`/signup/last-name`} component={LastName} />
            <Route
              exact
              path={`/signup/phone-number`}
              component={PhoneNumber}
            />
            <Route exact path={`/signup/username`} component={Username} />
            <Route exact path={`/signup/password`} component={Password} />
            <Route exact path={`/signup/pin`} component={Pin} />
            <Route exact path={`/signup/invites`} component={Invites} />
            <Route exact path={`/signup/hipaa`} component={Hipaa} />
            <Route
              exact
              path={`/signup/app-download`}
              component={AppDownload}
            />
            <Route exact path="/reset-password" component={SendEmail} />
            <Route
              exact
              path="/reset-password/:token"
              component={SetPassword}
            />
          </div>
        </Provider>
      </Router>
    );
  }
}
