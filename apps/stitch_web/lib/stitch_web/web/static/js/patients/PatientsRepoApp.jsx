import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, AppAlert } from "common/components";

import PatientsRepo from "./PatientsRepo";

@inject("titleStore")
@observer
class PatientsRepoApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Patients");
  }

  render() {
    const { titleStore } = this.props;

    return (
      <div id="app" className="preview-app">
        <AppAlert />
        <div className="admin-wrapper appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />
          <div className="admin-content">
            <div className="admin-content-wrapper">
              <Switch>
                <Route path="/patients" component={PatientsRepo} />
                <Redirect to="/" />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PatientsRepoApp;
