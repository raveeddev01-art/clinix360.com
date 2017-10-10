import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import UsernamePanel from "./username-panel";
import EmailPanel from "./email-panel";
import PasswordPanel from "./password-panel";
import PINPanel from "./pin-panel";

const header = (
  <h1><i className="fa fa-cog"></i> Account</h1>
);

class AccountSettings extends Component {
  render() {
    return (
      <Panel className="admin-panel" header={header}>
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
