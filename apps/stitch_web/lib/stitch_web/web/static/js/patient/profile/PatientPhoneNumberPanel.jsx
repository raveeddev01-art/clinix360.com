import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import PhoneNumberPanel from "../../common/components/phone-number-panel/phone-number-panel";

const title = "Phone Number";
const description =
  "Your phone number will be used for healthcare provider to contact you.";

@inject("currentPatientStore")
@observer
class PatientPhoneNumberPanel extends Component {
  render() {
    const { phone, savePhone } = this.props.currentPatientStore;

    return (
      <PhoneNumberPanel
        title={title}
        description={description}
        phoneNumber={phone}
        savePhone={savePhone}
        {...this.props}
      />
    );
  }
}

PatientPhoneNumberPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default PatientPhoneNumberPanel;
