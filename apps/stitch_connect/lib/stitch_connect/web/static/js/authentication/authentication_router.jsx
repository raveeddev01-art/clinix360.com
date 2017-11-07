import React, { Component } from "react";
import { withRouter, Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import GetStarted from "./get_started";
import TeamPicker from "./team/team_picker";
import FindTeam from "./team/find_team";
import SelectTeam from "./team/select_team";
import Login from "./login/login";
import Registration from "./registration";
import SendEmail from "./reset-password/send-email";
import SetPassword from "./reset-password/set-password";
import Header from "../website/components/header";
import Footer from "../website/components/footer";

@inject("titleStore")
@observer
class AuthenticationRouter extends Component {
  render() {
    const { titleStore } = this.props;
    return (
      <div className="onboarding-wrapper">
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
              path="/login"
              render={() => <Login {...this.props} />}
            />
            <Route path="/signup" component={Registration} />

            <Route exact path="/reset-password" component={SendEmail} />
            <Route
              exact
              path="/reset-password/:token"
              component={SetPassword}
            />

            <Route component={() => <Redirect to="/" />} />
          </Switch>
        </div>
        <Footer />
      </div>
    );
  }
}

export default withRouter(AuthenticationRouter);
