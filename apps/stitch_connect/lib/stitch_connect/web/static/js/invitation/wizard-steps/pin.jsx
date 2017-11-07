import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card";
import PinInput from "../../common/components/pin-input/index";

@inject("invitationStore")
@observer
class Pin extends Component {
  constructor(...args) {
    super(...args);
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

  onSubmit = () => {
    const { onNext, invitationStore } = this.props;
    const { formValid, pin } = this.state;

    if (!formValid) return;
    invitationStore.pin = pin;
    onNext();
  };
  render() {
    const { onBack, onRestart } = this.props;
    const { formValid } = this.state;
    return (
      <OnboardCard
        title="PIN"
        description={
          <span>
            Enter a <strong>4-digit pin</strong>.
          </span>
        }
        onNext={this.onSubmit}
        onBack={onBack}
        onRestart={onRestart}
        disableNext={!formValid}
      >
        <PinInput
          className="m-b-20 m-center"
          onValid={this.onValid}
          onInvalid={this.onInvalid}
        />
        <HelpBlock className="m-b-20">
          You can use this pin when your screen is locked after a period of
          inactivity.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

Pin.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default Pin;
