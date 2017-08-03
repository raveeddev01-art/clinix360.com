import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "mobx-react";

import SendEmail from "./send-email.jsx";
import SetPassword from "./set-password.jsx";
import resetPasswordStore from "./stores/reset_password_store";

const stores = { resetPasswordStore };

export default class ResetPasswordRouter extends Component {
  componentWillMount() {
    resetPasswordStore.token = this.props.token;
    resetPasswordStore.teamId = this.props.teamId;
  }

  render() {
    return (
      <Router>
        <Provider {...stores}>
          <div className="authentication-wrapper">
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
