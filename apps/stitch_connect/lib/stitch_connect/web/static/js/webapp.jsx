import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import Sidemenu from "./sidemenu/sidemenu";
import Group from "./group/group";

import sidemenuStore from "./stores/sidemenu_store";
import RootStore from "./stores/root_store";

export default class Webapp extends Component {
  constructor(props) {
    super();

    sidemenuStore.instance = props;
    this.rootStore = new RootStore(props);
  }

  render() {
    const stores = {
      sidemenuStore,
      addonStore: this.rootStore.addonStore,
      groupStore: this.rootStore.groupStore,
      messageStore: this.rootStore.messageStore,
      presenceStore: this.rootStore.presenceStore,
    };

    return (
      <Router>
        <Provider {...stores}>
          <div id="app">
            <Sidemenu />
            <Switch>
              <Route exact path={`/`} component={Group} />
              <Route path={`/groups/:slug`} component={Group} />
            </Switch>
          </div>
        </Provider>
      </Router>
    );
  }
}
