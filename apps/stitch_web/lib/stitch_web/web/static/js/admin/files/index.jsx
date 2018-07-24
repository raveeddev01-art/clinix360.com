import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";

import FileDetailPage from "./FileDetailPage";
import FilesPage from "./FilesPage";

@inject("titleStore")
@observer
class FilesApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Files");
  }

  render() {
    return (
      <Switch>
        <Route exact path="/admin/files/f:id" component={FileDetailPage} />
        <Route exact path="/admin/files" component={FilesPage} />

        <Redirect to="/admin/you/account" />
      </Switch>
    );
  }
}

export default FilesApp;
