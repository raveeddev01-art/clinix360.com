import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import OnboardCard from "../onboard-card/onboard-card";
import PinInput from "../../../common/components/pin-input/index";

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

  render() {
    return (
      <OnboardCard
        {...this.props}
        title="PIN"
        description={
          <span>
            Enter a <strong>4-digit PIN</strong>.
          </span>
        }
        disableNext={!this.state.formValid}
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

PinCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

PinCard.defaultProps = {
  onNext: () => {},
  backUrl: "",
  restartUrl: ""
};

export default PinCard;
