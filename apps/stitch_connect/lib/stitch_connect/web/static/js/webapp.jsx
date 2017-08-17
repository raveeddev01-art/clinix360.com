import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Sidemenu from "./sidemenu/sidemenu";
import GroupMessaging from "./chat/group-messaging";
import DirectMessaging from "./chat/direct-messaging";

import RootStore from "./stores/root_store";

export default class Webapp extends Component {
  constructor(props) {
    super(props);
    this.rootStore = new RootStore(props);
  }

  render() {
    return (
      <Router>
        <Provider {...this.rootStore}>
          <div id="app">
            <Sidemenu />
            <Switch>
              <Route exact path={`/`} component={GroupMessaging} />
              <Route path={`/groups/:slug`} component={GroupMessaging} />
              <Route path={`/direct/:usernames`} component={DirectMessaging} />
            </Switch>
          </div>
        </Provider>
      </Router>
    );
  }
}
