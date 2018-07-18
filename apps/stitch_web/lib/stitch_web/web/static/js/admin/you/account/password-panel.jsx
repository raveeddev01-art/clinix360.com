import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import PasswordPanel from "../../../common/components/password-panel/password-panel";

@inject("userStore")
@observer
class UserPasswordPanel extends Component {
  render() {
    const savePassword = this.props.userStore.savePassword;
    return <PasswordPanel savePassword={savePassword} {...this.props} />;
  }
}

UserPasswordPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default UserPasswordPanel;
