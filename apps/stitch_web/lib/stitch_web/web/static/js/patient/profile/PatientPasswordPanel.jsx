import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import PasswordPanel from "../../common/components/password-panel/password-panel";

@inject("currentPatientStore")
@observer
class PatientPasswordPanel extends Component {
  render() {
    const savePassword = this.props.currentPatientStore.savePassword;
    return <PasswordPanel savePassword={savePassword} {...this.props} />;
  }
}

PatientPasswordPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default PatientPasswordPanel;
