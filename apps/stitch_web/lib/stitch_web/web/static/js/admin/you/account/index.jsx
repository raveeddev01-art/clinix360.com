import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
import UsernamePanel from "./username-panel";
import EmailPanel from "./email-panel";
import PasswordPanel from "./password-panel";
import PINPanel from "./pin-panel";
import TimezonePanel from "./timezone-panel";
import DeactivatePanel from "./deactivate-panel";
import withAlertState from "../../../util/with_alert_state";

@inject("userStore", "titleStore", "adminPanelStore")
@withAlertState
class AccountSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Account");
    this.props.adminPanelStore.setHeading("Account", "fa-cog");
  }

  _nonAdminsOnly = () => {
    return !this.props.userStore.roles.includes("admin");
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-cog" /> Account
          </h1>
        </Panel.Heading>

        <Panel.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          <UsernamePanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <EmailPanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <PasswordPanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <PINPanel
            onSuccess={this.onSuccess}
            onError={this.onError}
            hideAlert={this.hideAlert}
          />
          <TimezonePanel />
          {this._nonAdminsOnly() && <DeactivatePanel onError={this.onError} />}
        </Panel.Body>
      </Panel>
    );
  }
}

export default AccountSettings;
