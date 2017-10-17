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

@inject("titleStore")
@observer
class AuthenticationRouter extends Component {
  render() {
    const { titleStore } = this.props;
    return (
      <div className="onboarding-wrapper">
        <div id="header">
          <div className="container">
            <Row>
              <Col xs={5}>
                <a href={`https://${applicationHost}/`} className="brand">
                  <img src="/images/stitch-brand.png" alt="Stitch" />
                </a>
              </Col>

              <Col xs={7}>
                <ul className="list-inline text-right m-b-0">
                  <li>
                    <a
                      href={`https://${applicationHost}/signin`}
                      className="nav-link"
                    >
                      Sign In
                    </a>
                  </li>

                  <li>
                    <a
                      href={`https://${applicationHost}/signup/email`}
                      className="nav-link btn-outline"
                    >
                      Create Team
                    </a>
                  </li>
                </ul>
              </Col>
            </Row>
          </div>
        </div>
        <div className="authentication-wrapper">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switch>
            <Route exact path="/getstarted" component={GetStarted} />
            <Route exact path="/signin" component={TeamPicker} />
            <Route exact path="/find-teams" component={FindTeam} />
            <Route exact path="/select-team" component={SelectTeam} />

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
      </div>
    );
  }
}

export default withRouter(AuthenticationRouter);
