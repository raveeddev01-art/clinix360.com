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

  reset = () => {
    this.setState({
      invites: [
        {
          email: ""
        }
      ],
      sent: false
    });
  };

  handleChange = index => evt => {
    const { invites } = this.state;

    invites[index].email = evt.target.value;
    this.setState({ invites });
  };

  addInvite = () => {
    this.setState({
      invites: [
        ...this.state.invites,
        {
          email: ""
        }
      ]
    });
  };

  validate() {
    const { invites } = this.state;
    let valid = true;

    invites.forEach(invite => {
      const email = invite.email.trim();

      if (!email) {
        return;
      }

      if (isEmail(email)) {
        invite.error = "";
      } else {
        invite.error = "Invalid email";

        valid = false;
      }
    });

    this.setState({ invites });

    return valid;
  }

  sendInvites = () => {
    const { invites } = this.state;

    if (!this.validate()) {
      return;
    }

    const filteredEmails = invites
      .map(invite => invite.email)
      .filter(email => !!email.trim());

    if (filteredEmails.length) {
      post(`/api/v1/invitations`, {
        body: { email_collection: filteredEmails.join(",") }
      }).then(() => {
        this.setState({ sent: true });
      });
    }
  };

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
          <Form horizontal className="invite-forms">
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
                      onChange={this.handleChange(index)}
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
                onClick={this.addInvite}
              >
                Add Invitation
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {sent ? (
            <Button bsSize="large" bsStyle="primary" onClick={this.reset}>
              Clear
            </Button>
          ) : (
            <Button bsSize="large" bsStyle="primary" onClick={this.sendInvites}>
              Send
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}

InvitationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

InvitationModal.defaultProp = {
  show: false,
  toggle: () => {}
};

export default InvitationModal;
