import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { Switcher, AppAlert } from "common/components";
import EmptySidebar from "../common/components/sidebar/empty-sidebar";
import Sidebar from "./sidebar/sidebar";

import Engage from "./Engage";
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
      <div id="app">
        <AppAlert />
        <div className="appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />

          {engageEnabled ? <Sidebar /> : <EmptySidebar />}

          <Switch>
            {engageEnabled ? (
              <Route path={`/conversations/:id`} component={Engage} />
            ) : (
              <Route path={`/engage`} component={EngagePreview} />
            )}

            {/* <Redirect from="*" to={`/conversations/1`} /> */}
          </Switch>
        </div>
      </div>
    );
  }
}

export default EngageApp;
