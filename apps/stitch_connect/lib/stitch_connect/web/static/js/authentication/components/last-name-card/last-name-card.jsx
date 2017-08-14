import React, { Component, PropTypes } from "react";
import OnboardInputCard from "../onboard-input-card/onboard-input-card";

class LastNameCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="Last Name"
        description={
          <span>
            Enter your <strong>last name</strong>.
          </span>
        }
        helperText="Your name will be shown next to your profile and messages."
        placeholder="Last Name"
      />
    );
  }
}

LastNameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

LastNameCard.defaultProps = {
  onNext: () => {}
};

export default LastNameCard;
