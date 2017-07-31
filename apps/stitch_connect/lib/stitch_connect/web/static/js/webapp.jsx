import React, { Component } from "react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import DropdownButton from "react-bootstrap/lib/DropdownButton";

import TopNav from "./top_nav.jsx";
import Chat from "./chat/chat.jsx";

import sidemenuStore from "./chat/sidemenu/sidemenu_store.js";

export default class Webapp extends Component {
  constructor(props) {
    super();
    sidemenuStore.instance = props;
  }

  render() {
    return (
      <div id="app">
        <TopNav />
        <Chat />
      </div>
    );
  }
}
