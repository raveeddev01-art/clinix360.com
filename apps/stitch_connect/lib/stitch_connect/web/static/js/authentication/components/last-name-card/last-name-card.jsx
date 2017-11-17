import React, { Component } from "react";
import PropTypes from "prop-types";
import { OnboardInputCard } from "common/components";

class LastNameCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="Last Name"
        helperText="Your name will be shown next to your profile and messages."
        placeholder="Last Name"
      >
        Enter your <strong>last name</strong>.
      </OnboardInputCard>
    );
  }
}

LastNameCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

LastNameCard.defaultProps = {
  onNext: () => {}
};

export default LastNameCard;
