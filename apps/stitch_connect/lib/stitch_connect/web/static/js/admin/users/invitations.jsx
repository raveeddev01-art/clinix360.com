import React, { Component } from "react";
import { Creatable } from "react-select";
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

  _handleChange = value => {
    this.setState({ email: value });
  };

  _onSave = () => {
    const { email } = this.state;

    // Perform email validation
    const lines = email.map(item => item.value);
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
    return (
      <Panel className="admin-panel" header={header}>
        <h4>Add invitation e-mails</h4>

        <FormGroup controlId="formControlsTextarea">
          <Creatable
            multi={true}
            joinValues={true}
            className="multi-select-large"
            placeholder="Type in an email"
            onChange={this._handleChange}
            value={this.state.email}
            noResultsText=""
            promptTextCreator={label => `Add an email - ${label}`}
          />

          <Row>
            <Col md={10}>
              <HelpBlock>
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
