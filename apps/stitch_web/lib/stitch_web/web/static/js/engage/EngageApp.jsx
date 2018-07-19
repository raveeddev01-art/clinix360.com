import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, Loading, AppAlert } from "common/components";

import Engage from "./Engage";

@inject("titleStore", "teamStore", "inboxStore")
@observer
class EngageApp extends Component {
  componentWillMount() {
    const { titleStore, inboxStore } = this.props;

    titleStore.setPageName("Engage");
    inboxStore.loadEngage();
  }

  render() {
    const { titleStore, inboxStore } = this.props;

    if (!inboxStore.engageLoaded) {
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
            <Route path="/conversations/:id" component={Engage} />
            <Redirect from="*" to="/conversations/1" />
          </Switch>
        </div>
      </div>
    );
  }
}

export default EngageApp;
