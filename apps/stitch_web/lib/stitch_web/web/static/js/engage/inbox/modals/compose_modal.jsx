import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Modal from "react-bootstrap/lib/Modal";

import Patients from "./patients/patients";

@inject("inboxStore")
@observer
class ComposeModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      patient: {},
      message: ""
    };
  }

  componentWillMount() {
    this.setState({
      patient: {},
      error: null
    });
  }

  updatePatient = value => {
    this.setState({ patient: value });
  };

  updateValue = field => evt => {
    this.setState({ [field]: evt.target.value });
  };

  createConversation = () => {
    const { inboxStore, closeModal } = this.props;

    inboxStore
      .createConversation({
        patient_id: this.state.patient.id,
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
          error: "This conversation already exists."
        });
      });

    closeModal();
  };

  renderModalHeader() {
    const { closeModal } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>Compose</Modal.Title>
        <Button
          bsSize="xsmall"
          onClick={this.props.showAddPatientModal}
          className="m-r-10"
        >
          New Patient
        </Button>
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
        <Button bsSize="large" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          bsSize="large"
          bsStyle="primary"
          onClick={this.createConversation}
        >
          Send
        </Button>
      </Modal.Footer>
    );
  }

  renderComposeModal() {
    const { patient, message } = this.state;

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
              <Patients onChange={this.updatePatient} value={patient} />
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
                onChange={this.updateValue("message")}
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
        {this.renderComposeModal()}
        {this.renderModalFooter()}
      </div>
    );
  }
}

ComposeModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  showAddPatientModal: PropTypes.func.isRequired
};

export default withRouter(ComposeModal);
