import React, { Component } from "react";
import PropTypes from "prop-types";
import { OnboardInputCard } from "common/components";

class FirstNameCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="First Name"
        helperText="Your name will be shown next to your profile and messages."
        placeholder="First Name"
      >
        Enter your <strong>first name</strong>.
      </OnboardInputCard>
    );
  }
}

FirstNameCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

FirstNameCard.defaultProps = {
  onNext: () => {}
};

export default FirstNameCard;
