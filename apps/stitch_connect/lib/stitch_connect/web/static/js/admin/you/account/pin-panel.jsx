import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import SettingPanel from "../../components/setting-panel/setting-panel";
import PinInput from "../../../common/components/pin-input/index";

const title = "PIN";
const description =
  "Set your PIN. This will be used to resume Stitch after inactivity lockouts.";

@inject("userStore")
@observer
class UsernamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: "",
      formValid: false
    };
  }

  onInvalid = () => {
    this.setState({ formValid: false, pin: "" });
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
    this.props.userStore.savePIN(this.state.pin);
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
        />
      </SettingPanel>
    );
  }
}

export default UsernamePanel;
