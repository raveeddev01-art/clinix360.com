import React, { Component } from "react";
import { Route, Switch, Redirect, BrowserRouter } from "react-router-dom";
import { observer } from "mobx-react";
import { Helmet } from "react-helmet";
import cx from "classnames";
import UploadZone from "file-upload/upload-zone";
import PatientConversations from "./PatientConversations";
import PatientSidebar from "./PatientSidebar";
import PatientInfo from "./PatientInfo";
import PatientHome from "./PatientHome";
import PatientProfile from "./profile/PatientProfile";

@observer
class PatientEngageApp extends Component {
  render() {
    return (
      <div id="app">
        <BrowserRouter>
          <UploadZone isEngage>
            <div
              className={cx("appContainer", "engage-wrapper", "admin-wrapper")}
            >
              <Helmet>
                <title>Clinix360 Engage</title>
              </Helmet>
              <PatientSidebar />
              <Switch>
                <Route exact path="/patient/home" component={PatientHome} />
                <Route
                  exact
                  path="/patient/conversations"
                  component={PatientConversations}
                />
                <Route
                  exact
                  path="/patient/conversations/:id"
                  component={PatientConversations}
                />
                <Route
                  exact
                  path="/patient/profile"
                  component={PatientProfile}
                />
                <Route exact path="/patient/info" component={PatientInfo} />
                <Redirect from="/patient" to="/patient/home" />
                <Redirect from="/patient/*" to="/patient/home" />
              </Switch>
            </div>
          </UploadZone>
        </BrowserRouter>
      </div>
    );
  }
}

export default PatientEngageApp;
