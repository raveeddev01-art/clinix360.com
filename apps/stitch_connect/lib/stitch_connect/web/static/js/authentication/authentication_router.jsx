import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Email from "./registration/email.jsx";
import Login from "./login/login.jsx";

export default class AuthenticationRouter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div>
          <Route exact path={`/`} component={Email} />
          <Route exact path={`/login`} component={Login} />
        </div>
      </Router>
    );
  }
}
