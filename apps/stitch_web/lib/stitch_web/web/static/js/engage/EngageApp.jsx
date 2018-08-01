import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import UploadZone from "file-upload/upload-zone";

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
    const { latestConversation } = inboxStore;

    if (!inboxStore.engageLoaded) {
      return <Loading />;
    }

    return (
      <UploadZone isEngage>
        <AppAlert />
        <div className="appContainer">
          <Helmet>
            <title>{titleStore.title}</title>
          </Helmet>
          <Switcher />

          <Switch>
            <Route exact path="/conversations/:id" component={Engage} />
            {latestConversation && (
              <Redirect
                from="*"
                to={`/conversations/${latestConversation.id}`}
              />
            )}
          </Switch>
        </div>
      </UploadZone>
    );
  }
}

export default EngageApp;
