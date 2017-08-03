import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import Sidemenu from "./sidemenu/sidemenu.jsx";
import ChatContainer from "./chat/chat_container.jsx";

import sidemenuStore from "./sidemenu/sidemenu_store.js";

const stores = { sidemenuStore };

export default class Webapp extends Component {
  constructor(props) {
    super();
    sidemenuStore.instance = props;
  }

  render() {
    return (
      <Router>
        <div id="app">
          <Sidemenu />
          <Switch>
            <Route
              exact
              path={`/`}
              component={ChatContainer}
            />
            <Route
              path={`/channels/public/:name`}
              component={ChatContainer}
            />
            <Route
              path={`/channels/direct/:name`}
              component={ChatContainer}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}
