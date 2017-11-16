import React, { Component } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Alert from "react-bootstrap/lib/Alert";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import isEmail from "validator/lib/isEmail";

class InviteModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: "default",
      emails: "",
      show: props.show,
      invites: [
        {
          email: ""
        }
      ],
      sent: false,
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({
        show: nextProps.show,
        invites: [
          {
            email: ""
          }
        ],
        sent: false,
        emails: ""
      });
    }
  }

  onChange = index => evt => {
    const { invites } = this.state;
    const invite = invites[index];

    invite.email = evt.target.value;
    invite.error =
      !invite.email || isEmail(invite.email) ? "" : "Invalid email";

    this.setState({ invites });
  };

  onChangeEmails = event => {
    this.setState({ emails: event.target.value });
  };

  onAddInvite = () => {
    this.setState({
      invites: [
        ...this.state.invites,
        {
          email: ""
        }
      ]
    });
  };

  onAddBulk = () => {
    this.setState({
      mode: "bulk"
    });
  };

  onAddSingles = () => {
    this.setState({
      mode: "default"
    });
  };

  onSubmit = evt => {
    evt.preventDefault();

    const { sent } = this.state;

    if (sent) {
      this.reset();
    } else {
      this.sendInvites();
    }
  };

  reset() {
    this.setState({
      invites: [
        {
          email: ""
        }
      ],
      sent: false,
      emails: "",
      alertVisible: false
    });
  }

  trimEmptyInvites() {
    const { invites } = this.state;

    return invites.filter(invite => !!invite.email.trim());
  }

  isValid() {
    return this.trimEmptyInvites().every(invite => !invite.error);
  }

  sendInvites() {
    this.setState({ alertVisible: false });

    const { mode } = this.state;
    let filteredEmails = [];

    if (mode === "default") {
      if (!this.isValid()) {
        return;
      }
      filteredEmails = this.trimEmptyInvites().map(invite => invite.email);
    } else {
      const { emails } = this.state;
      // Perform email validation
      const lines = emails.split("\n");
      lines.forEach(line => {
        if (/(\w+)@(\w+)\.[a-zA-Z]/g.test(line)) {
          filteredEmails.push(line.trim());
        }
      });
    }

    if (filteredEmails.length) {
      post(`/api/v1/invitations`, {
        body: { email_collection: filteredEmails.join(",") }
      })
        .then(() => {
          this.setState({ sent: true });
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
  }

  render() {
    const { mode, show, invites, sent, emails } = this.state;
    const { alertMessage, alertVisible, alertStyle } = this.state;
    const { toggle } = this.props;

    return (
      <Modal className="invite-people-modal" show={show} onHide={toggle}>
        <Modal.Header>
          <Modal.Title>Invite People</Modal.Title>
          <a role="link" onClick={toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          {mode === "bulk" ? (
            <h5>Enter multiple email addresses.</h5>
          ) : (
            <h5>
              Enter <strong>invitations</strong> to email out.
            </h5>
          )}
          <Form
            horizontal
            className="invite-forms"
            onSubmit={this.onSubmit}
            noValidate
          >
            {mode === "bulk" ? (
              <FormGroup controlId="formControlsTextarea">
                <Col md={12}>
                  <FormControl
                    componentClass="textarea"
                    rows="6"
                    value={emails}
                    disabled={sent}
                    onChange={this.onChangeEmails}
                  />
                  <HelpBlock className="text-muted">
                    You can send multiple e-mail invitations at once.
                  </HelpBlock>
                </Col>
              </FormGroup>
            ) : (
              invites.map((invite, index) => {
                const inviteError = !!invite.error;
                // const inviteSent = sent && !!invite.email.trim();
                const validationState = inviteError ? "error" : null;

                return (
                  <FormGroup
                    bsSize="large"
                    key={`invite_${index}`}
                    validationState={validationState}
                  >
                    <Col componentClass={ControlLabel} sm={3}>
                      Email
                    </Col>

                    <Col sm={9}>
                      <FormControl
                        type="email"
                        value={invite.email}
                        disabled={sent}
                        onChange={this.onChange(index)}
                      />

                      {inviteError && (
                        <HelpBlock>
                          <i className="fa fa-exclamation-circle" />{" "}
                          {invite.error}
                        </HelpBlock>
                      )}
                    </Col>
                  </FormGroup>
                );
              })
            )}
          </Form>

          <Row className="m-u-20">
            {mode === "bulk" ? (
              <Col sm={12}>
                <a disabled={sent} onClick={this.onAddSingles}>
                  <strong>Switch back to single entries</strong>
                </a>
              </Col>
            ) : (
              <Col sm={12}>
                <a disabled={sent} onClick={this.onAddInvite}>
                  <strong>Add Invitation</strong>
                </a>{" "}
                or{" "}
                <a disabled={sent} onClick={this.onAddBulk}>
                  <strong>Add Bulk</strong>
                </a>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="primary" onClick={this.onSubmit}>
            {sent ? "Clear" : "Send"}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

InviteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

export default InviteModal;
