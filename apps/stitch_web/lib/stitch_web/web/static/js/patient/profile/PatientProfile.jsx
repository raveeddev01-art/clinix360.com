import React, { Component } from "react";
import pick from "lodash/pick";
import Alert from "react-bootstrap/lib/Alert";
import Panel from "react-bootstrap/lib/Panel";

import NamePanel from "./NamePanel";
import PasswordPanel from "./PasswordPanel";
import PhoneNumberPanel from "./PhoneNumberPanel";

class PatientProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
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
    const commonPanelProps = pick(this, "onSuccess", "onError", "hideAlert");
    return (
      <div className="admin-content">
        <div className="flex-header admin-topbar">
          <h4>
            <span>
              <i className="fa fa-user" /> Profile
            </span>
          </h4>
        </div>
        <div className="admin-content-wrapper">
          <Panel className="admin-panel">
            <Panel.Heading>
              <h1>
                <i className="fa fa-user" /> Profile
              </h1>
            </Panel.Heading>

            <Panel.Body>
              {alertVisible && (
                <Alert bsStyle={alertStyle}>{alertMessage}</Alert>
              )}
              <NamePanel {...commonPanelProps} />
              <PhoneNumberPanel {...commonPanelProps} />
              <PasswordPanel {...commonPanelProps} />
            </Panel.Body>
          </Panel>
        </div>
      </div>
    );
  }
}

export default PatientProfile;
