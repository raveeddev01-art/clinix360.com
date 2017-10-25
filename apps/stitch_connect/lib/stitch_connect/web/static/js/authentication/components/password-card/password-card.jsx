import React, { Component } from "react";
import PropTypes from "prop-types";
import PasswordValidator from "password-validator";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../onboard-card/onboard-card";

class PasswordCard extends Component {
  constructor(props) {
    super(props);
    this.passwordValidator = new PasswordValidator();
    this.state = {
      password: "",
      formValid: false,
      passwordLengthValid: false,
      passwordLowercaseValid: false,
      passwordUppercaseValid: false,
      passwordDigitsValid: false,
      passwordSymbolsValid: false
    };
  }

  _isPasswordValid = val => {
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
    return result.length === 0;
  };

  _onChange = evt => {
    this.setState({
      password: evt.target.value,
      formValid: this._isPasswordValid(evt.target.value)
    });
  };

  _onNext = () => this.props.onNext(this.state.password);

  _renderPasswordHelper = () => {
    const {
      passwordLengthValid,
      passwordUppercaseValid,
      passwordLowercaseValid,
      passwordDigitsValid,
      passwordSymbolsValid
    } = this.state;
    return (
      <HelpBlock className="m-b-20">
        Your password must contain:
        <ul className="list-unstyled text-success">
          <li className={!passwordLengthValid && "text-danger"}>
            At least 8 characters
          </li>
          <li className={!passwordUppercaseValid && "text-danger"}>
            An uppercase letter
          </li>
          <li className={!passwordLowercaseValid && "text-danger"}>
            A lowercase letter
          </li>
          <li className={!passwordDigitsValid && "text-danger"}>A number</li>
          <li className={!passwordSymbolsValid && "text-danger"}>
            A special character (e.g. !$#)
          </li>
        </ul>
      </HelpBlock>
    );
  };

  render() {
    const { password, formValid } = this.state;
    return (
      <OnboardCard
        {...this.props}
        title="Password"
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
        onNext={this._onNext}
        disableNext={!formValid}
      >
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
            type="password"
            placeholder="Password"
            value={password}
            onChange={this._onChange}
          />
        </FormGroup>
        {this._renderPasswordHelper()}
      </OnboardCard>
    );
  }
}

PasswordCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string
};

PasswordCard.defaultProps = {
  onNext: () => {}
};

export default PasswordCard;
