import React, { Component } from "react";
import { Route, Switch, Redirect, BrowserRouter } from "react-router-dom";
import { observer } from "mobx-react";
import { Helmet } from "react-helmet";
import cx from "classnames";

import PatientEngage from "./PatientEngage";
import PatientSidebar from "./PatientSidebar";
import PatientInfo from "./PatientInfo";
import PatientHome from "./PatientHome";
import PatientProfile from "./profile/PatientProfile";

@observer
class PatientEngageApp extends Component {
  componentWillMount() {
    // do things here?
  }

  render() {
    return (
      <div id="app">
        <BrowserRouter>
          <div
            className={cx("appContainer", "engage-wrapper", "admin-wrapper")}
          >
            <Helmet>
              <title>Stitch Engage</title>
            </Helmet>
            <PatientSidebar />
            <Switch>
              <Route exact path="/patient/home" component={PatientHome} />
              <Route exact path="/patient/messages" component={PatientEngage} />
              <Route exact path="/patient/profile" component={PatientProfile} />
              <Route exact path="/patient/info" component={PatientInfo} />
              <Redirect from="/patient" to="/patient/home" />
              <Redirect from="/patient/*" to="/patient/home" />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default PatientEngageApp;
