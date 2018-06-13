import React, { Component } from "react";
// import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Modal from "react-bootstrap/lib/Modal";
import Row from "react-bootstrap/lib/Row";

import { AvatarUploader, LoadingIcon } from "common/components";

const patientStatusText = patient => {
  if (!patient.active) {
    return "deactivated";
  }

  return patient.onboarded ? "active" : "pending";
};

@inject("patientsStore")
@observer
class PatientModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalPatientId: null,
      isSaving: false,
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
    this.setState({
      isSaving: false,
      modalPatientId: null
    });

    this.props.patientsStore.closeModal();
  };

  handleChange = attr => e => {
    const newParams = Object.assign({}, this.state.patientParams, {
      [attr]: e.target.value
    });

    this.setState({ patientParams: newParams });
  };

  handleSubmit = () => {
    const { createPatient, updatePatient } = this.props.patientsStore;
    const apiCall = this.state.patientParams.id
      ? updatePatient(this.state.patientParams.id, this.state.patientParams)
      : createPatient(this.state.patientParams);

    this.makeApiCall(apiCall);
  };

  handleDeactivate = () => {
    const { deactivatePatient } = this.props.patientsStore;
    this.makeApiCall(deactivatePatient(this.state.patientParams.id));
  };

  handleActivate = () => {
    const { activatePatient } = this.props.patientsStore;
    this.makeApiCall(activatePatient(this.state.patientParams.id));
  };

  makeApiCall = callPromise => {
    this.setState({ isSaving: true });

    return callPromise
      .then(() => {
        this.closeModal();
      })
      .catch(() => {
        this.setState({ isSaving: false });
      });
  };

  renderLoadingIcon = () => {
    const { isSaving } = this.state;

    return isSaving && <LoadingIcon className="on-right" />;
  };

  renderActiveChange = () => {
    const { isSaving, patientParams } = this.state;
    const cb = patientParams.active
      ? this.handleDeactivate
      : this.handleActivate;
    const text = patientParams.active
      ? "Deactivate Patient"
      : "Activate Patient";

    return (
      <Button disabled={isSaving} bsSize="large" onClick={cb}>
        {text}
      </Button>
    );
  };

  render() {
    const { isSaving } = this.state;
    const { modalOpen } = this.props.patientsStore;
    const alertVisible = false;
    const alertStyle = "danger";
    const alertMessage = "oh noes";

    const {
      avatar,
      first_name,
      last_name,
      phone_number,
      email,
      id,
      mrn
    } = this.state.patientParams;
    const hasAvatar = (avatar || "").includes(
      "stitch-content/default-avatar.png"
    );

    return (
      <Modal
        show={modalOpen}
        onHide={this.closeModal}
        className="patient-modal"
        bsSize="large"
      >
        <Modal.Header>
          <Modal.Title>Patient Info</Modal.Title>
          <a onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
          <Row>
            <Col sm={6}>
              <Form
                className="edit-profile-form"
                onSubmit={this.onSubmit}
                noValidate
              >
                {id && (
                  <FormGroup bsSize="large">
                    <ControlLabel>Status</ControlLabel>
                    <FormControl
                      disabled
                      name="status"
                      type="text"
                      value={patientStatusText(this.state.patientParams)}
                    />
                  </FormGroup>
                )}
                <FormGroup bsSize="large">
                  <ControlLabel>Email</ControlLabel>
                  <FormControl
                    name="email"
                    disabled={!!id}
                    required
                    autoFocus={!id}
                    type="text"
                    value={email}
                    onChange={this.handleChange("email")}
                  />
                </FormGroup>
                <FormGroup bsSize="large">
                  <ControlLabel>First Name</ControlLabel>
                  <FormControl
                    name="first_name"
                    required
                    autoFocus={!!id}
                    type="text"
                    value={first_name}
                    onChange={this.handleChange("first_name")}
                  />
                </FormGroup>
                <FormGroup bsSize="large">
                  <ControlLabel>Last Name</ControlLabel>
                  <FormControl
                    name="last_name"
                    required
                    type="text"
                    value={last_name}
                    onChange={this.handleChange("last_name")}
                  />
                </FormGroup>
                <FormGroup bsSize="large">
                  <ControlLabel>MRN</ControlLabel>
                  <FormControl
                    name="mrn"
                    required
                    type="text"
                    value={mrn}
                    onChange={this.handleChange("mrn")}
                  />
                </FormGroup>
                <FormGroup bsSize="large">
                  <ControlLabel>Phone Number</ControlLabel>
                  <FormControl
                    name="phone_number"
                    required
                    type="text"
                    value={phone_number}
                    onChange={this.handleChange("phone_number")}
                  />
                </FormGroup>
                {this.renderActiveChange()}
              </Form>
            </Col>
            <Col sm={6} smOffset={0}>
              <h4>
                <strong>Profile Photo</strong>
              </h4>
              <AvatarUploader
                className="profile-image-form"
                hasAvatar={hasAvatar}
                onError={this.showError}
                isUploading={false}
                url={
                  avatar ||
                  "https://s3.amazonaws.com/stitch-content-public/default-avatar.png"
                }
                size={400}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button disabled={isSaving} bsSize="large" onClick={this.closeModal}>
            Close
          </Button>
          <Button
            disabled={isSaving}
            bsSize="large"
            bsStyle="primary"
            onClick={this.handleSubmit}
          >
            Save
            {this.renderLoadingIcon()}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default PatientModal;
