import React, { Component, PropTypes } from "react";
import { inject, observer } from "mobx-react";
import PasswordValidator from "password-validator";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Form from "react-bootstrap/lib/Form";
import Button from "react-bootstrap/lib/Button";
import Card from "../components/card/card.jsx";

@inject("resetPasswordStore")
@observer
class SetPassword extends Component {
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

  _onSubmit = evt => {
    evt.preventDefault();
    this.props.resetPasswordStore
      .resetPassword(this.state.password)
      .then(() => {
        this.props.history.push("/login");
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
    const { password } = this.state;
    return (
      <Card
        title="Reset Password"
        description={
          <span>
            Enter a <strong>password</strong>.
          </span>
        }
      >
        <Form onSubmit={this._onSubmit}>
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
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
          >
            Submit
          </Button>
        </Form>
      </Card>
    );
  }
}

export default SetPassword;
