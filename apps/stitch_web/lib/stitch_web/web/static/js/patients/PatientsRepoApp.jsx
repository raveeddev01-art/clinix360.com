import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, Loading, AppAlert } from "common/components";

import PatientsRepo from "./PatientsRepo";

@inject("titleStore", "patientsStore")
@observer
class PatientsRepoApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Patients");
  }

  render() {
    const { titleStore, patientsStore } = this.props;
    // const { firstPatientId } = patientsStore;

    if (!patientsStore.initialLoadDone) {
      return <Loading />;
    }

    return (
      <div id="app">
        <AppAlert />
        <div className="appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>

          <Switcher />

          <Switch>
            <Route path="/patients/:id" component={PatientsRepo} />
            <Route path="/patients" component={PatientsRepo} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default PatientsRepoApp;
