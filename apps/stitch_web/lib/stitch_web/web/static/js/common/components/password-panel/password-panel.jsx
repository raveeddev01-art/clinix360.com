import React, { Component } from "react";
import PropTypes from "prop-types";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import { PasswordValidator } from "common/components";
import SettingPanel from "../../../admin/components/setting-panel/setting-panel";

const title = "Password";
const description =
  "Set a new password. You'll be prompted to meet security requirements.";

class PasswordPanel extends Component {
  constructor(props) {
    super(props);
    this.passwordValidator = new PasswordValidator();
    this.state = {
      oldPassword: "",
      newPassword: "",
      formInvalid: false,
      showNewPassword: false,
      showOldPassword: false
    };
  }

  _onToggleEdit = () => {
    this.setState({
      oldPassword: "",
      newPassword: "",
      formInvalid: false
    });
  };

  toggleOldPasswordShow = () => {
    const { showOldPassword } = this.state;
    this.setState({
      showOldPassword: !showOldPassword
    });
  }

  toggleNewPasswordShow = () => {
    const { showNewPassword } = this.state;
    this.setState({
      showNewPassword: !showNewPassword
    });
  }

  _onSave = () => {
    const { hideAlert, onSuccess, onError, savePassword } = this.props;
    const { oldPassword, newPassword } = this.state;
    if (oldPassword === newPassword) {
      onError("Old password and new password can not be same.");
      return Promise.resolve();
    }

    hideAlert();
    return savePassword(oldPassword, newPassword)
      .then(() => {
        onSuccess("Your password has been successfully updated.");
        this.setState({
          newPassword: "",
          oldPassword: ""
        });
      })
      .catch(err => {
        if (err.data && err.data.message) onError(err.data.message);
        else onError("Unknown server response");
      });
  };

  _onChangeOldPassword = evt =>
    this.setState({ oldPassword: evt.target.value });

  _onChangeNewPassword = evt => {
    this.setState({
      newPassword: evt.target.value
    });
  };

  _onChangeValid = formInvalid => {
    this.setState({ formInvalid });
  };

  render() {
    const { oldPassword, newPassword, formInvalid } = this.state;

    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
        disableSave={formInvalid || oldPassword === ""}
      >
        <Row>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>Old Password</ControlLabel>
            {/* <FormControl
              type="password"
              bsSize="large"
              placeholder="Old Password"
              value={oldPassword}
              onChange={this._onChangeOldPassword}
            /> */}
            <FormGroup 
              bsSize="large" 
              className="password-formgroup"
            >
              <FormControl
                name='password'
                autoComplete="off"
                type={this.state.showOldPassword ? "text" : "password"}
                placeholder="Old Password"
                maxLength={80}
                value={oldPassword}
                onChange={this._onChangeOldPassword}
              />
              <div className="password-icon" onClick={this.toggleOldPasswordShow}>
                <i className={this.state.showOldPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} />
              </div>
            </FormGroup>
          </Col>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>New Password</ControlLabel>
            <FormGroup 
              bsSize="large" 
              className="password-formgroup"
            >
              <FormControl
                name='password'
                autoComplete="off"
                type={this.state.showNewPassword ? "text" : "password"}
                placeholder="New Password"
                maxLength={80}
                value={newPassword}
                onChange={this._onChangeNewPassword}
              />
              <div className="password-icon" onClick={this.toggleNewPasswordShow}>
                <i className={this.state.showNewPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} />
              </div>
            </FormGroup>
            {/* <FormControl
              type="password"
              bsSize="large"
              placeholder="New Password"
              value={newPassword}
              onChange={this._onChangeNewPassword}
            /> */}
            <PasswordValidator
              password={newPassword}
              onChangeValid={this._onChangeValid}
            />
          </Col>
        </Row>
      </SettingPanel>
    );
  }
}

PasswordPanel.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  hideAlert: PropTypes.func.isRequired,
  savePassword: PropTypes.func.isRequired
};

export default PasswordPanel;
