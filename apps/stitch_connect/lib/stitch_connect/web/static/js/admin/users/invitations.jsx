import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import {
  Panel,
  Row,
  Col,
  FormGroup,
  FormControl,
  HelpBlock,
  Button
} from "react-bootstrap";

const header = (
  <h1><i className="fa fa-envelope-o"></i> Invitations</h1>
);

@inject("teamStore")
@observer
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

  _onSave = () => {
    const { email } = this.state;

    // Perform email validation
    const lines = email.split('\n');
    let emails = [];
    for (let line of lines) {
      // only push this line if it contains a valid email.
      if (/(\w+)\@(\w+)\.[a-zA-Z]/g.test(line)) {
        emails.push($.trim(line));
      }
    }

    if (emails.length > 0) {
      post(`/api/v1/invitations`, {
        body: { email_collection: emails.join(",") }
      }).then(response => {
        notify.show("Invitations sent to all users");
      });
    } else {
      notify.show("You haven't provided any valid email address!", "error");
    }
  };

  render() {
    const { email } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
        <h4>Add invitation e-mails</h4>
        <FormGroup controlId="formControlsTextarea">
          <FormControl
            componentClass="textarea"
            rows="6"
            onChange={this._handleChange}
          />
          <Row>
            <Col md={10}>
              <HelpBlock className="text-muted">
                You can send multiple e-mail invitations at once.
              </HelpBlock>
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
