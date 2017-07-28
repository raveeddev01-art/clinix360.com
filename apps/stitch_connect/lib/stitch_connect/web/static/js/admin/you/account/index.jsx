import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import UsernamePanel from "./username-panel.jsx";
import EmailPanel from "./email-panel.jsx";
import PasswordPanel from "./password-panel.jsx";
import PINPanel from "./pin-panel.jsx";

class AccountSettings extends Component {
  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title text-center">Account</h1>
        <UsernamePanel />
        <hr />
        <EmailPanel />
        <hr />
        <PasswordPanel />
        <hr />
        <PINPanel />
      </Panel>
    );
  }
}

export default AccountSettings;
