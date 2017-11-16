import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import PasswordValidator from "password-validator";

class PasswordValidatorComponent extends Component {
  constructor(...args) {
    super(...args);
    this.passwordValidator = new PasswordValidator();
    this.state = {
      passwordLengthValid: false,
      passwordLowercaseValid: false,
      passwordUppercaseValid: false,
      passwordDigitsValid: false,
      passwordSymbolsValid: false
    };
  }

  componentDidMount() {
    this.isPasswordValid(this.props.password);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.password !== nextProps.password) {
      this.isPasswordValid(nextProps.password);
    }
  }

  isPasswordValid = val => {
    this.passwordValidator
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces()
      .has()
      .symbols();

    const result = this.passwordValidator.validate(val, { list: true });
    this.setState({ passwordLengthValid: !result.includes("min") });
    this.setState({ passwordLowercaseValid: !result.includes("lowercase") });
    this.setState({ passwordUppercaseValid: !result.includes("uppercase") });
    this.setState({ passwordDigitsValid: !result.includes("digits") });
    this.setState({ passwordSymbolsValid: !result.includes("symbols") });
    this.props.onChangeValid(result.length > 0);
  };

  render() {
    const {
      passwordLengthValid,
      passwordUppercaseValid,
      passwordLowercaseValid,
      passwordDigitsValid,
      passwordSymbolsValid
    } = this.state;

    return (
      <HelpBlock className="m-b-20 password-validator">
        Your password must contain:
        <ul className="list-unstyled password-checklist">
          <li className={cx({ "text-danger": !passwordLengthValid })}>
            {passwordLengthValid ? (
              <i className="fa fa-check" />
            ) : (
              <i className="fa fa-close" />
            )}&nbsp; At least 8 characters
          </li>
          <li className={cx({ "text-danger": !passwordUppercaseValid })}>
            {passwordUppercaseValid ? (
              <i className="fa fa-check" />
            ) : (
              <i className="fa fa-close" />
            )}&nbsp; An uppercase letter
          </li>
          <li className={cx({ "text-danger": !passwordLowercaseValid })}>
            {passwordLowercaseValid ? (
              <i className="fa fa-check" />
            ) : (
              <i className="fa fa-close" />
            )}&nbsp; A lowercase letter
          </li>
          <li className={cx({ "text-danger": !passwordDigitsValid })}>
            {passwordDigitsValid ? (
              <i className="fa fa-check" />
            ) : (
              <i className="fa fa-close" />
            )}&nbsp; A number
          </li>
          <li className={cx({ "text-danger": !passwordSymbolsValid })}>
            {passwordSymbolsValid ? (
              <i className="fa fa-check" />
            ) : (
              <i className="fa fa-close" />
            )}&nbsp; A special character (e.g. !$#)
          </li>
        </ul>
      </HelpBlock>
    );
  }
}

PasswordValidatorComponent.propTypes = {
  password: PropTypes.string,
  onChangeValid: PropTypes.func
};

PasswordValidatorComponent.defaultProps = {
  password: "",
  onChangeValid: () => {}
};

export default PasswordValidatorComponent;
