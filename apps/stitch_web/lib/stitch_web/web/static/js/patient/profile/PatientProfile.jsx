import React, { Component } from "react";
import pick from "lodash/pick";
import Alert from "react-bootstrap/lib/Alert";
import Panel from "react-bootstrap/lib/Panel";
import withAlertState from "../../util/with_alert_state";

import NamePanel from "./NamePanel";
import PatientPasswordPanel from "./PatientPasswordPanel";
import PatientPhoneNumberPanel from "./PatientPhoneNumberPanel";

class PatientProfile extends Component {
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
              <PatientPhoneNumberPanel {...commonPanelProps} />
              <PatientPasswordPanel {...commonPanelProps} />
            </Panel.Body>
          </Panel>
        </div>
      </div>
    );
  }
}

export default withAlertState(PatientProfile);
