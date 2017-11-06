import React, { Component } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import isEmail from "validator/lib/isEmail";

class InvitationModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: props.show,
      invites: [
        {
          email: ""
        }
      ],
      sent: false
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
        sent: false
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
      sent: false
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
    if (!this.isValid()) {
      return;
    }

    const filteredEmails = this.trimEmptyInvites().map(invite => invite.email);

    if (filteredEmails.length) {
      post(`/api/v1/invitations`, {
        body: { email_collection: filteredEmails.join(",") }
      }).then(() => {
        this.setState({ sent: true });
      });
    }
  }

  render() {
    const { show, invites, sent } = this.state;
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
          <h5>
            Enter <strong>invitations</strong> to email out.
          </h5>
          <Form
            horizontal
            className="invite-forms"
            onSubmit={this.onSubmit}
            noValidate
          >
            {invites.map((invite, index) => {
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

                    {inviteSent && (
                      <HelpBlock>
                        <i className="fa fa-check-circle" /> Invite has been
                        sent
                      </HelpBlock>
                    )}
                  </Col>
                </FormGroup>
              );
            })}
          </Form>

          <Row>
            <Col sm={12} className="text-right">
              <Button
                bsStyle="default"
                bsSize="xs"
                className="add-invite"
                disabled={sent}
                onClick={this.onAddInvite}
              >
                Add Invitation
              </Button>
            </Col>
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

InvitationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

export default InvitationModal;
