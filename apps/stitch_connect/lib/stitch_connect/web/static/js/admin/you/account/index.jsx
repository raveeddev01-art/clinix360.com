import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import UsernamePanel from "./username-panel";
import EmailPanel from "./email-panel";
import PasswordPanel from "./password-panel";
import PINPanel from "./pin-panel";

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
