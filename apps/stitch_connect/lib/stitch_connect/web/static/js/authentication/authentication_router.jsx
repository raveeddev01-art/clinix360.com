import React, { Component } from "react";
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import cx from "classnames";

import GetStarted from "./get_started";
import TeamPicker from "./team/team_picker";
import FindTeam from "./team/find_team";
import FindTeamError from "./team/find_team_error";
import SelectTeam from "./team/select_team";
import Login from "./login/login";
import Loggedout from "./logged-out/logged-out";
import DownloadApps from "./apps";
import Registration from "./registration";
import SendEmail from "./reset-password/send-email";
import SetPassword from "./reset-password/set-password";
import Invitation from "./invitation";
import InvitationError from "./invitation/error";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";

@inject("titleStore")
@observer
class AuthenticationRouter extends Component {
  render() {
    const { titleStore } = this.props;
    const onboardingWrapperClass = cx("onboarding-wrapper", {
      "on-electron": window.electronApp
    });

    return (
      <div className={onboardingWrapperClass}>
        <Header />
        <div className="authentication-wrapper">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switch>
            <Route exact path="/getstarted" component={GetStarted} />
            <Route exact path="/signin" component={TeamPicker} />
            <Route exact path="/find-your-team" component={FindTeam} />
            <Route exact path="/find-your-team/:token" component={SelectTeam} />
            <Route
              exact
              path="/find-your-team/:token/login"
              component={FindTeamError}
            />

            <Route
              exact
              path="/login"
              render={() => <Login {...this.props} />}
            />
            <Route
              exact
              path="/logged-out"
              render={() => <Loggedout {...this.props} />}
            />
            <Route
              exact
              path="/apps"
              render={() => <DownloadApps {...this.props} />}
            />
            <Route path="/signup" component={Registration} />

            <Route exact path="/reset-password" component={SendEmail} />
            <Route
              exact
              path="/reset-password/:token"
              component={SetPassword}
            />

            <Route
              path="/invitations/accept/:token"
              render={() => <Invitation {...this.props} />}
            />
            <Route
              exact
              path="/invitations/error"
              component={InvitationError}
            />

            <Route component={() => <Redirect to="/" />} />
          </Switch>
        </div>
        {!window.electronApp && <Footer />}
      </div>
    );
  }
}

export default withRouter(AuthenticationRouter);
