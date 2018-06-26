import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { Switcher, AppAlert } from "common/components";

import FilePage from "./FilePage";
import FilesPage from "./FilesPage";

@inject("titleStore", "teamFilesStore")
@observer
class FilesApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Files");
  }

  render() {
    const { titleStore } = this.props;

    return (
      <div id="app" className="app">
        <AppAlert />
        <div className="admin-wrapper appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />
          <div className="admin-content">

            <div className="admin-content-wrapper">
              <Switch>
                <Route path="/files/f:id" component={FilePage} />
                <Route path="/files" component={FilesPage} />
                <Redirect to="/" />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FilesApp;
