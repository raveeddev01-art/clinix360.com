import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Modal from "react-bootstrap/lib/Modal";

import Patients from "./patients/patients";

const noop = () => {};

class ComposeModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      patient: null,
      subject: "",
      message: ""
    };
  }

  handlePatientChange = value => {
    this.setState({ patient: value });
  };

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  create = () => {
    const { createConversation, closeModal } = this.props;

    createConversation(this.state)
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

  renderModalHeader = () => {
    const { closeModal } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>Compose</Modal.Title>
        {!this.props.asPatient && (
          <Button
            bsSize="xsmall"
            onClick={this.props.showAddPatientModal}
            className="m-r-10"
          >
            New Patient
          </Button>
        )}
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  };

  renderModalFooter = () => {
    const { closeModal } = this.props;
    const disabled =
      !this.state.subject ||
      !this.state.message ||
      (!this.state.patient && !this.props.asPatient);

    return (
      <Modal.Footer>
        <Row>
          <Col sm={9} smOffset={3}>
            <div className="pull-right">
              <Button bsSize="large" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                bsSize="large"
                bsStyle="primary"
                onClick={this.create}
                disabled={disabled}
              >
                Send
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Footer>
    );
  };

  renderComposeModal = () => {
    const { patient, subject, message } = this.state;

    return (
      <Modal.Body>
        <Form horizontal>
          {!!this.state.error && (
            <Alert bsStyle="danger">{this.state.error}</Alert>
          )}

          {!this.props.asPatient && (
            <FormGroup bsSize="large">
              <Col componentClass={ControlLabel} sm={3}>
                Patient
              </Col>

              <Col sm={9}>
                <Patients
                  name="patient"
                  onChange={this.handlePatientChange}
                  value={patient}
                  showAddPatientModal={this.props.showAddPatientModal}
                />
              </Col>
            </FormGroup>
          )}

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
  };

  render() {
    return (
      <div>
        {this.renderModalHeader()}
        {this.renderComposeModal()}
        {this.renderModalFooter()}
      </div>
    );
  }
}

ComposeModal.defaultProps = {
  asPatient: false,
  showAddPatientModal: noop
};

ComposeModal.propTypes = {
  asPatient: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
  createConversation: PropTypes.func.isRequired,
  showAddPatientModal: PropTypes.func
};

export default withRouter(ComposeModal);
