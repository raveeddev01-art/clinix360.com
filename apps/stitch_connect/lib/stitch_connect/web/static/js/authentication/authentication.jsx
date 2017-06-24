import React, { Component } from "react";

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
import Downloads from "./registration/hipaa.jsx";
import AppDownload from "./registration/app_download.jsx";

export default class Authentication extends Component {
  render() {
    return (
        <div className="authentication-wrapper">
            <Login />
            <ResetPassword />
            
            <hr/>

            <Email />
            <Confirmation />
            <TeamName />
            <FirstName />
            <LastName />
            <PhoneNumber />
            <Username />
            <Password />
            <Pin />
            <Invites />
            {/*<Hipaa />
            <AppDownload />*/}
        </div>
    );
  }
}