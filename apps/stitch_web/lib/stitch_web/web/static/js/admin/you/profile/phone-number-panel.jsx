import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import PhoneNumberPanel from "../../../common/components/phone-number-panel/phone-number-panel";

@inject("userStore")
@observer
class UserPhoneNumberPanel extends Component {
  render() {
    const { phone, savePhone } = this.props.userStore;

    return (
      <PhoneNumberPanel
        phoneNumber={phone}
        savePhone={savePhone}
        {...this.props}
      />
    );
  }
}

UserPhoneNumberPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default UserPhoneNumberPanel;
