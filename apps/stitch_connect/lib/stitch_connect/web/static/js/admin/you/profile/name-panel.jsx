import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import SettingPanel from "../../components/setting-panel/setting-panel.jsx";

const title = "Name";
const description =
  "Your information will be shown alongside the messages you send in conversations.";

class NamePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: ""
    };
  }

  _onToggleEdit = () => {};
  _onSave = () => {};

  _onChangeFirstName = evt => this.setState({ firstName: evt.target.value });
  _onChangeLastName = evt => this.setState({ lastName: evt.target.value });

  render() {
    const { firstName, lastName } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        onSave={this._onSave}
        onEdit={this._onToggleEdit}
      >
        <Row>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>First Name</ControlLabel>
            <FormControl
              type="text"
              value={firstName}
              onChange={this._onChangeFirstName}
            />
          </Col>
          <Col sm={6} componentClass={FormGroup}>
            <ControlLabel>Last Name</ControlLabel>
            <FormControl
              type="text"
              value={lastName}
              onChange={this._onChangeLastName}
            />
          </Col>
        </Row>
      </SettingPanel>
    );
  }
}

export default NamePanel;
