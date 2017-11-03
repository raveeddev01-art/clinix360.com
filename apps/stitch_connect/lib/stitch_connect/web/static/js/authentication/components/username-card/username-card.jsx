import React, { Component } from "react";
import PropTypes from "prop-types";
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
        helperText="Your username is how other users will mention you in conversations. Unique & lowercase."
        placeholder="username"
      />
    );
  }
}

UsernameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string,
  isLowerCase: PropTypes.bool
};

UsernameCard.defaultProps = {
  onNext: () => {},
  isLowerCase: true
};

export default UsernameCard;
