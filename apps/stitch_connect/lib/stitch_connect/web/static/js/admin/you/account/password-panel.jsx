import React, { Component } from "react";
import PasswordValidator from "password-validator";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Password";
const description =
  "Set a new password. You'll be prompted to meet HIPAA security requirements.";

class PasswordPanel extends Component {
  constructor(props) {
    super(props);
    this.passwordValidator = new PasswordValidator();
    this.state = {
      oldPassword: "",
      newPassword: "",
      formValid: false,
      passwordLengthValid: false,
      passwordLowercaseValid: false,
      passwordUppercaseValid: false,
      passwordDigitsValid: false,
      passwordSymbolsValid: false
    };
  }

  _onToggleEdit = () => {};
  _onSave = () => {};

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

  _onChangeOldPassword = evt =>
    this.setState({ oldPassword: evt.target.value });

  _onChangeNewPassword = evt => {
    this.setState({
      newPassword: evt.target.value,
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
    const { oldPassword, newPassword, formValid } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
        disableSave={!formValid}
      >
        <Row>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>Old Password</ControlLabel>
            <FormControl
              type="password"
              bsSize="large"
              placeholder="Enter Old Password"
              value={oldPassword}
              onChange={this._onChangeOldPassword}
            />
          </Col>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              bsSize="large"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={this._onChangeNewPassword}
            />
            {this._renderPasswordHelper()}
          </Col>
        </Row>
      </SettingPanel>
    );
  }
}

export default PasswordPanel;
