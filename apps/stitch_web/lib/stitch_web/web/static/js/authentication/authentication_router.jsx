import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import cx from "classnames";

import GetStarted from "./components/get-started-card/get-started-card";
import TeamPicker from "./team/team_picker";
import FindTeam from "./team/find_team";
import FindTeamError from "./team/find_team_error";
import SelectTeam from "./team/select_team";
import Login from "./login/login";
import LoggedOut from "./logged-out/logged-out";
import DownloadApps from "./apps";
import Registration from "./registration";
import SendEmail from "./reset-password/send-email";
import SetPassword from "./reset-password/set-password";
import Invitation from "./invitation";
import InvitationError from "./invitation/error";
import HardRedirect from "../common/components/hard-redirect/hard-redirect";

@inject("titleStore")
@observer
class AuthenticationRouter extends Component {
  render() {
    const { titleStore } = this.props;
    const authWrapperClass = cx("authentication-page", {
      "on-electron": window.electronApp
    });

    return (
      <div className={authWrapperClass}>
        <Helmet>
          <title>{titleStore.title}</title>

          <script type="text/javascript">{`
              window.intercomSettings = {
                app_id: "jig8cj9z",
                hide_default_launcher: false
              };
          `}</script>
        </Helmet>
        <Switch>
          {/* PROVIDER ROUTES */}
          <Route path="/signup" component={Registration} />
          <Route exact path="/getstarted" component={GetStarted} />
          <Route exact path="/signin" component={TeamPicker} />
          <Route exact path="/find-your-team" component={FindTeam} />
          <Route exact path="/find-your-team/:token" component={SelectTeam} />
          <Route
            exact
            path="/find-your-team/:token/login"
            component={FindTeamError}
          />
          <Route exact path="/login" render={() => <Login {...this.props} />} />
          <Route
            exact
            path="/logged-out"
            render={() => <LoggedOut {...this.props} />}
          />
          <Route
            exact
            path="/apps"
            render={() => <DownloadApps {...this.props} />}
          />
          <Route exact path="/reset-password" component={SendEmail} />
          <Route exact path="/reset-password/:token" component={SetPassword} />
          <Route
            path="/invitations/accept/:token"
            render={() => <Invitation {...this.props} />}
          />
          <Route exact path="/invitations/error" component={InvitationError} />

          {/* PATIENT ROUTES */}
          <Route
            exact
            path="/patient/getstarted"
            component={props => <GetStarted asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/signin"
            component={props => <TeamPicker asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/find-your-team"
            component={props => <FindTeam asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/find-your-team/:token"
            component={props => <SelectTeam asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/find-your-team/:token/login"
            component={props => <Login asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/login"
            render={props => <Login asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/logged-out"
            render={props => <LoggedOut asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/reset-password"
            component={props => <SendEmail asPatient {...props} />}
          />
          <Route
            exact
            path="/patient/reset-password/:token"
            component={props => <SetPassword asPatient {...props} />}
          />
          <Route
            path="/patient/invitations/accept/:token"
            render={() => <Invitation asPatient {...this.props} />}
          />
          <Route
            exact
            path="/patient/invitations/error"
            component={InvitationError}
          />

          {/* HARD REDIRECT */}
          <Route
            exact
            push
            path="/"
            component={() => <HardRedirect to="/" />}
          />
        </Switch>
      </div>
    );
  }
}

export default withRouter(AuthenticationRouter);
