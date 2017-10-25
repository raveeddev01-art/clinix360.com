import React, { Component } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

class InvitationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      emails: [""]
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show, emails: [""] });
    }
  }

  handleChange = index => evt => {
    const { emails } = this.state;
    this.state.emails[index] = evt.target.value;
    this.setState({ emails });
  };

  addEmail = () => {
    this.setState({ emails: [...this.state.emails, ""] });
  };

  inviteUsers = () => {
    const { emails } = this.state;
    const filteredEmails = emails.filter(email => !!email.trim());
    if (filteredEmails.length) {
      post(`/api/v1/invitations`, {
        body: { email_collection: filteredEmails.join(",") }
      }).then(() => {
        notify.show(`Invitations sent to ${filteredEmails.length} users`);
      });
    }

    this.props.toggle();
  };

  render() {
    const { show, emails } = this.state;
    const { toggle } = this.props;
    return (
      <Modal className="invite-people-modal" show={show}>
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
            {emails.map((email, index) => (
              <FormGroup bsSize="large" key={`email_${index}`}>
                <Col componentClass={ControlLabel} sm={3}>
                  Email
                </Col>

                <Col sm={9}>
                  <FormControl
                    type="email"
                    value={email}
                    onChange={this.handleChange(index)}
                  />
                </Col>
              </FormGroup>
            ))}
          </Form>

          <Row>
            <Col sm={12} className="text-right">
              <Button
                bsStyle="default"
                bsSize="xs"
                className="add-invite"
                onClick={this.addEmail}
              >
                Add Invitation
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="primary" onClick={this.inviteUsers}>
            Send
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

InvitationModal.defaultProp = {
  show: false,
  toggle: () => {}
};

export default InvitationModal;
