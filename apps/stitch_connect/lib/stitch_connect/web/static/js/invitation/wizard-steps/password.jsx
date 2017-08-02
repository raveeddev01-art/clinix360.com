import React, { Component, PropTypes } from "react";
import { inject, observer } from "mobx-react";
import PasswordValidator from "password-validator";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import OnboardCard from "../components/onboard-card/onboard-card.jsx";

@inject("invitationStore")
@observer
class PasswordCard extends Component {
  constructor(props) {
    super(props);
    this.passwordValidator = new PasswordValidator();
    this.state = {
      formValid: false,
      passwordLengthValid: false,
      passwordLowercaseValid: false,
      passwordUppercaseValid: false,
      passwordDigitsValid: false,
      passwordSymbolsValid: false
    };
  }

  componentWillMount() {
    this.setState({
      formValid: this._isPasswordValid(this.props.invitationStore.password)
    });
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
    this.props.invitationStore.password = evt.target.value;
    this.setState({
      formValid: this._isPasswordValid(evt.target.value)
    });
  };

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
    const { onNext, onBack, onRestart, invitationStore } = this.props;
    const { formValid } = this.state;
    return (
      <OnboardCard
        title="Password"
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
        onNext={onNext}
        onBack={onBack}
        onRestart={onRestart}
        disableNext={!formValid}
      >
        <FormGroup bsSize="large">
          <FormControl
            required
            autoFocus
            type="password"
            placeholder="Password"
            value={invitationStore.password}
            onChange={this._onChange}
          />
        </FormGroup>
        {this._renderPasswordHelper()}
      </OnboardCard>
    );
  }
}

PasswordCard.propTypes = {
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  onRestart: PropTypes.func
};

export default PasswordCard;
