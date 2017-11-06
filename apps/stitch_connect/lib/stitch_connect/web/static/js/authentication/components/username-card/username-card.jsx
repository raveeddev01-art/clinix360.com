import React, { Component } from "react";
import PropTypes from "prop-types";
import OnboardInputCard from "../onboard-input-card/onboard-input-card";

class UsernameCard extends Component {
  render() {
    const { placeholder } = this.props;
    return (
      <OnboardInputCard
        {...this.props}
        title="Username"
        description={
          <span>
            Enter a <strong>username</strong>.
          </span>
        }
        helperText="Your username is how others will mention you. It should be unique and lowercase."
        placeholder={placeholder || "username"}
        isRequired={false}
      />
    );
  }
}

UsernameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string,
  isLowerCase: PropTypes.bool,
  placeholder: PropTypes.string
};

UsernameCard.defaultProps = {
  onNext: () => {},
  isLowerCase: true,
  placeholder: ""
};

export default UsernameCard;
