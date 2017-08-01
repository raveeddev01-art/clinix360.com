import React, { Component, PropTypes } from "react";
import OnboardInputCard from "../onboard-input-card/onboard-input-card.jsx";

class FirstNameCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="First Name"
        description={
          <span>
            Enter your <strong>first name</strong>.
          </span>
        }
        helperText="Your name will be shown next to your profile and messages."
        placeholder="First Name"
      />
    );
  }
}

FirstNameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

FirstNameCard.defaultProps = {
  onNext: () => {}
};

export default FirstNameCard;
