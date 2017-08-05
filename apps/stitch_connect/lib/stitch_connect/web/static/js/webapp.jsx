import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import Sidemenu from "./sidemenu/sidemenu.jsx";
import Group from "./group/group.jsx";

import sidemenuStore from "./sidemenu/sidemenu_store.js";
import groupStore from "./stores/group_store.jsx";

const stores = { groupStore, sidemenuStore };

export default class Webapp extends Component {
  constructor(props) {
    super();
    sidemenuStore.instance = props;
  }

  render() {
    return (
      <Router>
        <Provider {...stores}>
          <div id="app">
            <Sidemenu />
            <Switch>
              <Route
                exact
                path={`/`}
                component={Group}
              />
              <Route
                path={`/groups/:slug`}
                component={Group}
              />
            </Switch>
          </div>
        </Provider>
      </Router>
    );
  }
}
