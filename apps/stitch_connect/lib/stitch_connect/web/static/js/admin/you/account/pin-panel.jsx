import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import { PinInput } from "common/components";
import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "PIN";
const description =
  "Set your PIN. This will be used to resume Stitch after inactivity lockouts.";

@inject("userStore")
@observer
class PinPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: "",
      formValid: false
    };
  }

  onInvalid = () => {
    this.setState({ formValid: false });
  };

  onValid = pin => {
    this.setState({
      pin,
      formValid: pin.length === 4
    });
  };

  onToggleEdit = () => {
    this.setState({
      pin: ""
    });
  };

  onSave = () => {
    const { hideAlert, onSuccess, onError, userStore } = this.props;

    hideAlert();
    return userStore
      .savePIN(this.state.pin)
      .then(() => {
        onSuccess("Your PIN has been successfully updated.");
        this.setState({
          pin: ""
        });
      })
      .catch(err => {
        onError(err.data.message);
      });
  };

  render() {
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this.onSave}
        onEdit={this.onToggleEdit}
        disableSave={!this.state.formValid}
      >
        <PinInput
          onValid={this.onValid}
          onInvalid={this.onInvalid}
          pin={this.state.pin}
        />
      </SettingPanel>
    );
  }
}

PinPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired
};

export default PinPanel;
