import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { inject } from "mobx-react";
import UsernamePanel from "./username-panel";
import EmailPanel from "./email-panel";
import PasswordPanel from "./password-panel";
import PINPanel from "./pin-panel";

const header = (
  <h1>
    <i className="fa fa-cog" /> Account
  </h1>
);

@inject("titleStore", "adminPanelStore")
class AccountSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Account");
    this.props.adminPanelStore.setHeading("Account");
  }

  render() {
    return (
      <Panel className="admin-panel" header={header}>
        <UsernamePanel />
        <EmailPanel />
        <PasswordPanel />
        <PINPanel />
      </Panel>
    );
  }
}

export default AccountSettings;
