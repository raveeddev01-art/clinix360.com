import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

const header = (
  <h1>
    <i className="fa fa-envelope-o" /> Invitations
  </h1>
);

@inject("teamStore", "titleStore", "adminPanelStore")
@observer
export default class UsersInvitations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ""
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Invitations");
    this.props.adminPanelStore.setHeading("Invitations", "fa-envelope-o");
  }

  _handleChange = event => {
    this.setState({ email: event.target.value });
  };

  _onSave = () => {
    const { email } = this.state;

    // Perform email validation
    const lines = email.split("\n");
    const emails = [];
    lines.forEach(line => {
      if (/(\w+)@(\w+)\.[a-zA-Z]/g.test(line)) {
        emails.push(line.trim());
      }
    });

    if (emails.length > 0) {
      post(`/api/v1/invitations`, {
        body: { email_collection: emails.join(",") }
      }).then(() => {
        this.setState({ email: "" });
        notify.show("Invitations sent to all users");
      });
    } else {
      notify.show("You haven't provided any valid email address!", "error");
    }
  };

  render() {
    const { email } = this.state;

    return (
      <Panel className="admin-panel has-style" header={header}>
        <h4>Add invitation e-mails</h4>
        <FormGroup controlId="formControlsTextarea">
          <FormControl
            componentClass="textarea"
            rows="6"
            value={email}
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
