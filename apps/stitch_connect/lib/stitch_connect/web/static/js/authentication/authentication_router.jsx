import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import GetStarted from "./get_started.jsx";

import Login from "./login/login.jsx";
import ResetPassword from "./login/reset_password.jsx";

import Email from "./registration/email.jsx";
import Confirmation from "./registration/confirmation.jsx";
import TeamName from "./registration/team_name.jsx";
import FirstName from "./registration/first_name.jsx";
import LastName from "./registration/last_name.jsx";
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
          <Route exact path={`/login`} component={Login} />
        </div>
      </Router>
    );
  }
}
