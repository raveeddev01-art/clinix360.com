import React, { Component } from "react";
import PropTypes from "prop-types";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import { OnboardPage, PinInput } from "common/components";

class PinCard extends Component {
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

  onKeyPress = e => {
    const hitEnter = e.charCode === 13 || e.keyCode === 13;

    if (hitEnter && this.state.formValid) {
      this.onNext();
    }
  };

  onNext = () => this.props.onNext(this.state.pin);

  render() {
    const { saving, ...otherProps } = this.props;
    return (
      <div>
        <OnboardPage
          {...otherProps}
          title="Set your PIN"
          description={
            <span>
              Set a 4 digit PIN for lockout access into Stitch Connect.
            </span>
          }
          onNext={this.onNext}
          loading={saving}
          disableNext={!this.state.formValid}
        >
          <ControlLabel>PIN</ControlLabel>
          <PinInput
            className="m-b-20"
            onValid={this.onValid}
            onInvalid={this.onInvalid}
            onKeyPress={this.onKeyPress}
          />
          <HelpBlock className="onboarding-hint m-b-20">
            You can use this PIN when your screen is locked after a period of
            inactivity.
          </HelpBlock>
        </OnboardPage>
      </div>
    );
  }
}

PinCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired
};

export default PinCard;
