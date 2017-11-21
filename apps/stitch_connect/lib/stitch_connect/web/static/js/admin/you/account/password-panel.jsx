import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import SettingPanel from "../../components/setting-panel/setting-panel";
import PasswordValidator from "../../../common/components/password-validator/index";

const title = "Password";
const description =
  "Set a new password. You'll be prompted to meet HIPAA security requirements.";

@inject("userStore")
@observer
class PasswordPanel extends Component {
  constructor(props) {
    super(props);
    this.passwordValidator = new PasswordValidator();
    this.state = {
      oldPassword: "",
      newPassword: "",
      formInvalid: false
    };
  }

  _onToggleEdit = () => {
    this.setState({
      oldPassword: "",
      newPassword: "",
      formInvalid: false
    });
  };

  _onSave = () => {
    const { hideAlert, onSuccess, onError, userStore } = this.props;

    hideAlert();
    return userStore
      .savePassword(this.state.oldPassword, this.state.newPassword)
      .then(() => {
        onSuccess("Your password has been successfully updated.");
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
            <FormControl
              type="password"
              bsSize="large"
              placeholder="Old Password"
              value={oldPassword}
              onChange={this._onChangeOldPassword}
            />
          </Col>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              bsSize="large"
              placeholder="New Password"
              value={newPassword}
              onChange={this._onChangeNewPassword}
            />
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
  hideAlert: PropTypes.func.isRequired
};

export default PasswordPanel;
