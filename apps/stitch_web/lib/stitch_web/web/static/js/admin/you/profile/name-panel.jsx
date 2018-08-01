import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import NamePanel from "../../../common/components/name-panel/name-panel";

@inject("userStore")
@observer
class UserNamePanel extends Component {
  render() {
    const { firstName, lastName, saveName } = this.props.userStore;
    return (
      <NamePanel
        firstName={firstName}
        lastName={lastName}
        saveName={saveName}
        {...this.props}
      />
    );
  }
}

UserNamePanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default UserNamePanel;
