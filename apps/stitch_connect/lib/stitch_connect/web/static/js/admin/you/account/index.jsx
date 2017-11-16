import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
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
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Account");
    this.props.adminPanelStore.setHeading("Account", "fa-cog");
  }

  onSuccess = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "success"
    });
  };

  onError = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "danger"
    });
  };

  hideAlert = () => {
    this.setState({
      alertVisible: false
    });
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
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
      </Panel>
    );
  }
}

export default AccountSettings;
