import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Modal from "react-bootstrap/lib/Modal";

@inject("inboxStore")
@observer
class ComposeModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      subject: "",
      message: ""
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  createConversation = () => {
    const { inboxStore, closeModal, patient } = this.props;

    inboxStore
      .createConversation({
        patient_id: patient.id,
        subject: this.state.subject,
        text_content: this.state.message
      })
      .then(() => {
        this.setState({
          error: null
        });
        closeModal();
      })
      .catch(response => {
        this.setState({
          error: response.data.message
        });
      });

    closeModal();
  };

  renderModalHeader() {
    const { closeModal } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>Compose</Modal.Title>
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  renderModalFooter() {
    const { closeModal } = this.props;

    return (
      <Modal.Footer>
        <Row>
          <Col sm={9} smOffset={3}>
            <Button bsSize="large" className="attachment-btn">
              <i className="fa fa-paperclip" />
            </Button>

            <div className="pull-right">
              <Button bsSize="large" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                bsSize="large"
                bsStyle="primary"
                onClick={this.createConversation}
                disabled={!this.state.subject || !this.state.message}
              >
                Send
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Footer>
    );
  }

  renderModalBody() {
    const { patient } = this.props;
    const { subject, message } = this.state;

    return (
      <Modal.Body>
        <Form horizontal>
          {!!this.state.error && (
            <Alert bsStyle="danger">{this.state.error}</Alert>
          )}

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Patient
            </Col>

            <Col sm={9}>
              <FormControl name="patient" value={patient.full_name} disabled />
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Subject
            </Col>

            <Col sm={9}>
              <FormControl
                name="subject"
                type="text"
                value={subject}
                onChange={this.handleChange}
              />
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Message
            </Col>

            <Col sm={9}>
              <FormControl
                name="message"
                type="text"
                rows="7"
                componentClass="textarea"
                value={message}
                onChange={this.handleChange}
              />
            </Col>
          </FormGroup>
        </Form>
      </Modal.Body>
    );
  }

  render() {
    return (
      <div>
        {this.renderModalHeader()}
        {this.renderModalBody()}
        {this.renderModalFooter()}
      </div>
    );
  }
}

ComposeModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired
};

export default ComposeModal;
