import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, AppAlert } from "common/components";
import Sidebar from "./sidebar";

import EngagePreview from "./EngagePreview";

@inject("titleStore")
@observer
class EngageApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Engage");
  }

  render() {
    const { titleStore } = this.props;

    return (
      <div id="app">
        <AppAlert />
        <div className="engage-wrapper appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />
          <Sidebar />
          <div className="engage-content">
            <Switch>
              <Route path="/engage" component={EngagePreview} />
              <Redirect to="/" />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default EngageApp;
