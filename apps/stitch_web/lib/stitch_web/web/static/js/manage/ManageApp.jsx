import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, AppAlert } from "common/components";
import Sidebar from "./sidebar";

import ManagePreview from "./ManagePreview";

@inject("titleStore")
@observer
class ManageApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Manage");
  }

  render() {
    const { titleStore } = this.props;

    return (
      <div id="app" className="preview-app">
        <AppAlert />
        <div className="manage-wrapper appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />
          <Sidebar />
          <div className="manage-content">
            <Switch>
              <Route path="/manage" component={ManagePreview} />
              <Redirect to="/" />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default ManageApp;
