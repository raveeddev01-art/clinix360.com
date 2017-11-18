import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import { OnboardCard, PinInput } from "common/components";

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

  onNext = () => this.props.onNext(this.state.pin);

  render() {
    const { saving, ...otherProps } = this.props;
    return (
      <OnboardCard
        {...otherProps}
        title="PIN"
        description={
          <span>
            Enter a <strong>4-digit PIN</strong>.
          </span>
        }
        onNext={this.onNext}
        loading={saving}
        disableNext={!this.state.formValid}
      >
        <PinInput
          className="m-b-20 m-center"
          onValid={this.onValid}
          onInvalid={this.onInvalid}
        />
        <HelpBlock className="m-b-20">
          You can use this PIN when your screen is locked after a period of
          inactivity.
        </HelpBlock>
      </OnboardCard>
    );
  }
}

PinCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  saving: PropTypes.func.isRequired
};

PinCard.defaultProps = {
  onNext: () => {},
  saving: false
};

export default PinCard;
