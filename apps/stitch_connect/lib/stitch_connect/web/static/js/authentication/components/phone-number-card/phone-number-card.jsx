import React, { Component } from "react";
import PropTypes from "prop-types";
import OnboardInputCard from "../onboard-input-card/onboard-input-card";

class PhoneNumberCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="Phone Number"
        description={
          <span>
            Enter your <strong>phone number</strong>.
          </span>
        }
        helperText="Your phone number will be shown in your profile so you can be reached."
        placeholder="Phone Number"
      />
    );
  }
}

PhoneNumberCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

PhoneNumberCard.defaultProps = {
  onNext: () => {}
};

export default PhoneNumberCard;
