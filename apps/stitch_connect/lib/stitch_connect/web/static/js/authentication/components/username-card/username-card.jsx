import React, { Component, PropTypes } from "react";
import OnboardInputCard from "../onboard-input-card/onboard-input-card";

class UsernameCard extends Component {
  render() {
    return (
      <OnboardInputCard
        {...this.props}
        title="Username"
        description={
          <span>
            Enter a <strong>username</strong>.
          </span>
        }
        helperText="Your username is how other users will mention you in conversations. Pick something familiar."
        placeholder="Username"
      />
    );
  }
}

UsernameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

UsernameCard.defaultProps = {
  onNext: () => {}
};

export default UsernameCard;
