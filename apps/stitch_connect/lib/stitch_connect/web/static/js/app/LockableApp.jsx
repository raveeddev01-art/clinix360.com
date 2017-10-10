import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import Lockout from "../lockout/lockout";
import ChatApp from "./ChatApp";

@inject("presenceStore")
@observer
class LockableApp extends Component {
  componentDidMount() {
    const { onWindowFocus, onWindowBlur } = this.props.presenceStore;

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);

    onWindowBlur();
  }

  render() {
    return this.props.presenceStore.locked ? <Lockout /> : <ChatApp />;
  }
}

export default withRouter(LockableApp);
