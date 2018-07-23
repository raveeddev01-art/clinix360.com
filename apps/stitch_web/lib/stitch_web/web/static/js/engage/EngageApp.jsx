import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import cx from "classnames";

import { Switcher, AppAlert } from "common/components";
import EmptySidebar from "../common/components/sidebar/empty-sidebar";
import Sidebar from "./sidebar/sidebar";

import Engage from "./Engage";
import EngagePreview from "./EngagePreview";

@inject("titleStore", "teamStore", "inboxStore")
@observer
class EngageApp extends Component {
  componentWillMount() {
    const { titleStore, inboxStore, teamStore } = this.props;
    titleStore.setPageName("Engage");

    if (teamStore.engageEnabled) {
      inboxStore.loadEngage();
    }
  }

  render() {
    const { titleStore } = this.props;
    const { engageEnabled } = this.props.teamStore;

    return (
      <div id="app">
        <AppAlert />
        <div
          className={cx("appContainer", {
            "engage-wrapper": !engageEnabled
          })}
        >
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />

          {!engageEnabled && <EmptySidebar />}

          <Switch>
            <Route path="/engage" component={EngagePreview} />
            <Route path="/conversations/:id" component={Engage} />

            {engageEnabled ? (
              <Redirect from="*" to="/conversations/1" />
            ) : (
              <Redirect from="*" to="/engage" />
            )}
          </Switch>
        </div>
      </div>
    );
  }
}

export default EngageApp;
