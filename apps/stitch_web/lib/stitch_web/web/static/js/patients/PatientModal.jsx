import React, { Component } from "react";
// import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

@inject("patientsStore")
@observer
class PatientModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalPatientId: null,
      patientParams: {}
    };
  }

  componentWillUpdate({ patientsStore }) {
    // Any time the current patient changes,
    // reset any parts of state that are tied to that patient
    if (patientsStore.modalPatientId !== this.state.modalPatientId) {
      this.setState({
        modalPatientId: patientsStore.modalPatientId,
        patientParams: this.setNewPatient(
          this.props.patientsStore.getModalPatient()
        )
      });
    }
  }

  setNewPatient(patientInfo) {
    return Object.assign({}, patientInfo || {});
  }

  closeModal = () => {
    this.props.patientsStore.closeModal();
  };

  handleSubmit = () => {
    const { createPatient, closeModal } = this.props.patientsStore;

    createPatient(this.state.patientParams).then(() => {
      closeModal();
    });
  };

  render() {
    const { modalOpen } = this.props.patientsStore;

    return (
      <Modal
        show={modalOpen}
        onHide={this.closeModal}
        className="patient-modal"
      >
        <Modal.Header>
          <Modal.Title>Patient Info</Modal.Title>
          <a onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          {/* {error && <Alert bsStyle="danger">{error}</Alert>} */}
          <h1> {this.state.patientParams.first_name} </h1>
        </Modal.Body>

        <Modal.Footer>
          <Button bsSize="large" onClick={this.closeModal}>
            Close
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default PatientModal;
