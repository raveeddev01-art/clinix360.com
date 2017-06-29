import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import GetStarted from "./get_started.jsx";
import TeamPicker from "./team_picker.jsx";

import Login from "./login/login.jsx";
import ResetPassword from "./login/reset_password.jsx";

import Email from "./registration/email.jsx";
import Confirmation from "./registration/confirmation.jsx";
import TeamName from "./registration/team_name.jsx";
import FullName from "./registration/full_name.jsx";
import PhoneNumber from "./registration/phone_number.jsx";
import Username from "./registration/username.jsx";
import Password from "./registration/password.jsx";
import Pin from "./registration/pin.jsx";
import Invites from "./registration/invites.jsx";
import Hipaa from "./registration/hipaa.jsx";
import AppDownload from "./registration/app_download.jsx";

export default class AuthenticationRouter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div className="authentication-wrapper">
          <Route exact path={`/`} component={GetStarted} />
          <Route exact path={`/signin`} component={TeamPicker} />

          <Route exact path={`/login`} component={Login} />
          <Route exact path={`/reset-password`} component={ResetPassword} />

          <Route exact path={`/signup/email`} component={Email} />
          <Route
            exact
            path={`/signup/confirmation-code`}
            component={Confirmation}
          />
          <Route exact path={`/signup/team-name`} component={TeamName} />
          <Route exact path={`/signup/full-name`} component={FullName} />
          <Route exact path={`/signup/phone-number`} component={PhoneNumber} />
          <Route exact path={`/signup/username`} component={Username} />
          <Route exact path={`/signup/password`} component={Password} />
          <Route exact path={`/signup/pin`} component={Pin} />
          <Route exact path={`/signup/invites`} component={Invites} />
          <Route exact path={`/signup/hipaa`} component={Hipaa} />
          <Route exact path={`/signup/app-download`} component={AppDownload} />
        </div>
      </Router>
    );
  }
}
