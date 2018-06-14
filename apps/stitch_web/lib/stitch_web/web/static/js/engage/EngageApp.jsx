import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, AppAlert } from "common/components";
import EmptySidebar from "../common/components/sidebar/empty-sidebar";
import Sidebar from "./sidebar/sidebar";
import InboxMenu from "./inbox/inbox";

import EngagePreview from "./EngagePreview";

@inject("titleStore", "teamStore")
@observer
class EngageApp extends Component {
  componentWillMount() {
    const { titleStore } = this.props;
    titleStore.setPageName("Engage");
  }

  render() {
    const { titleStore } = this.props;
    const { engageEnabled } = this.props.teamStore;

    return (
      <div id="app" className="preview-app">
        <AppAlert />
        <div className="engage-wrapper appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />

          {engageEnabled ? <Sidebar /> : <EmptySidebar />}

          {engageEnabled && <InboxMenu />}

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
