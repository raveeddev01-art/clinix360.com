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
import _ from "lodash";

import isEmail from "validator/lib/isEmail";
import { extractEmails } from "../../util/utils";

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
        mode: "default",
        show: nextProps.show,
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
  }

  onChange = index => evt => {
    const { invites } = this.state;
    const invite = invites[index];
    invite.email = evt.target.value;
    if (invite.email.trim() === "" || isEmail(invite.email)) {
      invite.error = "";
    }
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

  onRemoveInvite = index => () => {
    const { invites } = this.state;
    if (invites.length <= 1) return;
    invites.splice(index, 1);
    this.setState({ invites });
  };

  onAddEmails = () => {
    const emails = extractEmails(this.state.emails) || [];

    let invites = [];
    emails.forEach(email => {
      if (isEmail(email)) {
        invites.push({
          email
        });
      }
    });
    invites = _.uniqBy(invites, invite => {
      return invite.email;
    });

    if (invites.length === 0) {
      this.setState({
        alertVisible: true,
        alertMessage: "We are not able to identify any valid emails.",
        alertStyle: "danger"
      });
      return;
    }

    this.setState({
      invites,
      mode: "default",
      emails: "",
      alertVisible: true,
      alertMessage: `Found ${invites.length} emails to invite.`,
      alertStyle: "success"
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

  switchToBulk = () => {
    const { invites } = this.state;
    const emails = _.uniqBy(invites, invite => {
      return invite.email.trim();
    })
      .map(invite => invite.email)
      .join(", ");

    this.setState({
      mode: "bulk",
      emails,
      alertVisible: false
    });
  };

  switchToSingles = () => {
    this.setState({
      mode: "default",
      alertVisible: false
    });
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

  prepareInvites() {
    const { invites } = this.state;

    let setFocus = false;
    invites.forEach((invite, id) => {
      invite.email = invite.email.trim();
      invite.error =
        !invite.email || isEmail(invite.email) ? "" : "Invalid email";
      if (invite.error && !setFocus) {
        this[`invite_${id}`].focus();
        setFocus = true;
      }
    });
    return invites.filter(invite => !!invite.email.trim());
  }

  isValid() {
    return this.prepareInvites().every(invite => !invite.error);
  }

  sendInvites() {
    this.setState({ alertVisible: false });

    if (!this.isValid()) {
      return;
    }
    const filteredEmails = this.prepareInvites().map(invite => invite.email);
    if (filteredEmails.length) {
      post(`/api/v1/invitations`, {
        body: { email_collection: filteredEmails.join(",") }
      })
        .then(() => {
          this.setState({ sent: true });
          this.setState({
            alertMessage:
              "You have successfully sent the following invitations.",
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
                </Col>
              </FormGroup>
            ) : (
              invites.map((invite, index) => {
                const inviteError = !!invite.error;
                const inviteSent = sent && !!invite.email.trim();
                const validationState = inviteError
                  ? "error"
                  : inviteSent ? "success" : null;

                return (
                  <FormGroup
                    bsSize="large"
                    key={`invite_${index}`}
                    validationState={validationState}
                  >
                    <Col componentClass={ControlLabel} xs={12} sm={3}>
                      Email
                    </Col>

                    <Col xs={10} sm={7}>
                      <FormControl
                        type="email"
                        value={invite.email}
                        disabled={sent}
                        onChange={this.onChange(index)}
                        inputRef={node => {
                          this[`invite_${index}`] = node;
                        }}
                      />

                      {inviteError && (
                        <HelpBlock>
                          <i className="fa fa-exclamation-circle" />{" "}
                          {invite.error}
                        </HelpBlock>
                      )}

                      {inviteSent && (
                        <HelpBlock>
                          <i className="fa fa-check-circle" /> Invite has been
                          sent
                        </HelpBlock>
                      )}
                    </Col>
                    <Col xs={2}>
                      {!sent &&
                        invites.length > 1 && (
                          <a
                            className="btn"
                            onClick={this.onRemoveInvite(index)}
                          >
                            <i className="fa fa fa-times-circle-o" />
                          </a>
                        )}
                    </Col>
                  </FormGroup>
                );
              })
            )}
          </Form>

          <Row className="m-u-20">
            {mode === "default" &&
              !sent && (
                <Col sm={12}>
                  <a disabled={sent} onClick={this.onAddInvite}>
                    <strong>Add Single Invitation</strong>
                  </a>{" "}
                  or{" "}
                  <a disabled={sent} onClick={this.switchToBulk}>
                    <strong>Add Multiple Invitations</strong>
                  </a>
                </Col>
              )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {mode === "bulk" ? (
            <div>
              <Button
                bsSize="large"
                bsStyle="primary"
                onClick={this.onAddEmails}
                className="pull-left"
              >
                Add Emails
              </Button>
              <Button
                bsSize="large"
                bsStyle="default"
                onClick={this.switchToSingles}
                className="pull-left"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button bsSize="large" bsStyle="primary" onClick={this.onSubmit}>
              {sent ? "Clear" : "Send"}
            </Button>
          )}
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
