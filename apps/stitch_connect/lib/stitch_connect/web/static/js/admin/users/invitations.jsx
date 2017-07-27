import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
  Panel,
  Row,
  Col,
  FormGroup,
  FormControl,
  HelpBlock,
  Button
} from "react-bootstrap";

// import SettingPanel from "../components/setting-panel/setting-panel.jsx";

export default class UsersInvitations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ""
    };
  }

  _handleChange = event => {
    this.setState({ email: event.target.value });
  };

  _clear = event => {
    event.preventDefault();
    this.setState({ email: "" });
  };

  _onSave = () => {
    console.log("Yeah boi");
  };

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="text-center">Invitations</h1>

        <h4>Add invitation e-mails</h4>

        <FormGroup controlId="formControlsTextarea">
          <FormControl
            className="m-b-10"
            componentClass="textarea"
            placeholder="textarea"
            value={this.state.email}
            onChange={this._handleChange}
            rows="6"
          />

          <Row>
            <Col md={10}>
              <HelpBlock>
                You can send multiple e-mail invitations at once.
              </HelpBlock>
            </Col>
            <Col md={2} className="text-right">
              <Button onClick={this._clear} bsSize="small">
                Clear
              </Button>
            </Col>
          </Row>
        </FormGroup>

        <Button
          bsStyle="primary"
          bsSize="large"
          className="btn-fancy pull-right"
          onClick={this._onSave}
        >
          Send
        </Button>
      </Panel>
    );
  }
}
