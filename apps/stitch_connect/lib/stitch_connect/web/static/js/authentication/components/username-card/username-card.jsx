import React, { Component } from "react";
import PropTypes from "prop-types";
import { OnboardInputCard } from "common/components";

class UsernameCard extends Component {
  render() {
    const { placeholder } = this.props;
    return (
      <OnboardInputCard
        {...this.props}
        title="Username"
        helperText="Your username is how others will mention you. It should be unique and lowercase."
        placeholder={placeholder || "username"}
        isRequired={false}
      >
        Enter a <strong>username</strong>.
      </OnboardInputCard>
    );
  }
}

UsernameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  isLowerCase: PropTypes.bool,
  placeholder: PropTypes.string
};

UsernameCard.defaultProps = {
  onNext: () => {},
  isLowerCase: true,
  placeholder: ""
};

export default UsernameCard;
