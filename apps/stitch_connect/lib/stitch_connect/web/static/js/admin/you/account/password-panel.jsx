import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Password";
const description =
  "Set a new password. You'll be prompted to meet HIPAA security requirements.";

class PasswordPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: "",
      newPassword: ""
    };
  }

  _onToggleEdit = () => {};
  _onSave = () => {};

  _onChangeOldPassword = evt =>
    this.setState({ oldPassword: evt.target.value });
  _onChangeNewPassword = evt =>
    this.setState({ newPassword: evt.target.value });

  render() {
    const { oldPassword, newPassword } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <Row>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>Old Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter Old Password"
              value={oldPassword}
              onChange={this._onChangeOldPassword}
            />
          </Col>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={this._onChangeNewPassword}
            />
          </Col>
        </Row>
      </SettingPanel>
    );
  }
}

export default PasswordPanel;
