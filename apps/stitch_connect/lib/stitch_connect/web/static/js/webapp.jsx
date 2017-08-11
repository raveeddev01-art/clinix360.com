import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import Sidemenu from "./sidemenu/sidemenu";
import Group from "./group/group";

import sidemenuStore from "./stores/sidemenu_store";
import presenceStore from "./stores/presence_store";
import groupStore from "./stores/group_store";
import addonStore from "./stores/addon_store";
import messageStore from "./stores/message_store";

const stores = {
  groupStore,
  sidemenuStore,
  presenceStore,
  addonStore,
  messageStore
};

export default class Webapp extends Component {
  constructor(props) {
    super();
    presenceStore.connectPresence(props.teamId);
    sidemenuStore.instance = props;
    messageStore.loadMessages();
  }

  render() {
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
