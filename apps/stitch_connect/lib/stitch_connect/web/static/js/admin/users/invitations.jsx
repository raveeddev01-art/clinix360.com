import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";
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
      email: "",
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
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

    this.setState({
      alertVisible: false
    });
    if (emails.length > 0) {
      post(`/api/v1/invitations`, {
        body: { email_collection: emails.join(",") }
      })
        .then(() => {
          this.setState({ email: "" });
          this.setState({
            alertMessage: "Invitations sent to all users.",
            alertVisible: true,
            alertStyle: "success"
          });
        })
        .catch(err => {
          this.setState({
            alertMessage: err.data.message,
            alertVisible: true,
            alertStyle: "danger"
          });
        });
    } else {
      this.setState({
        alertMessage: "You haven't provided any valid email address!",
        alertVisible: true,
        alertStyle: "danger"
      });
    }
  };

  render() {
    const { email } = this.state;
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel " header={header}>
        {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
        <div className="panel-settings">
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
            className="btn-fancy"
            onClick={this._onSave}
          >
            Send
          </Button>
        </div>
      </Panel>
    );
  }
}
