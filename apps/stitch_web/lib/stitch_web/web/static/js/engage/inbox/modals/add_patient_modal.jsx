import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import Modal from "react-bootstrap/lib/Modal";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@inject("inboxStore", "patientsStore")
@observer
class AddPatientModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      firstName: "",
      lastName: "",
      email: "",
      mrn: ""
    };
  }

  componentWillMount() {
    this.setState({
      error: null
    });
  }

  updateValue = field => evt => {
    this.setState({ [field]: evt.target.value });
  };

  generateMrnId = () => {
    const id = Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase();

    this.setState({ mrn: id });
  };

  addPatient = () => {
    const { patientsStore, closeModal } = this.props;

    patientsStore
      .createPatient({
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
        mrn: this.state.mrn
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
        <Modal.Title>Add Patient</Modal.Title>
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
        <div className="pull-right">
          <Button bsSize="large" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this.addPatient}
            disabled={
              !this.state.firstName || !this.state.lastName || !this.state.mrn
            }
          >
            Add
          </Button>
        </div>
      </Modal.Footer>
    );
  }

  renderAddPatientModal() {
    const { firstName, lastName, email, mrn } = this.state;

    return (
      <Modal.Body className="add-patient-modal">
        <Form horizontal>
          {!!this.state.error && (
            <Alert bsStyle="danger">{this.state.error}</Alert>
          )}

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              First Name
            </Col>

            <Col sm={9}>
              <FormControl
                name="firstName"
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={this.updateValue("firstName")}
              />
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Last Name
            </Col>

            <Col sm={9}>
              <FormControl
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={this.updateValue("lastName")}
              />
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Email
            </Col>

            <Col sm={9}>
              <FormControl
                name="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={this.updateValue("email")}
              />
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              MRN
            </Col>

            <Col sm={9}>
              <InputGroup className="mrn-field">
                <FormControl
                  name="mrn"
                  type="text"
                  placeholder="e.g. 12345678"
                  value={mrn}
                  onChange={this.updateValue("mrn")}
                  maxLength="25"
                />
                <InputGroup.Button>
                  <Button onClick={this.generateMrnId}>Auto Generate</Button>
                </InputGroup.Button>
              </InputGroup>

              <HelpBlock>
                Must be a unique ID and cannot contain special characters.
              </HelpBlock>
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
        {this.renderAddPatientModal()}
        {this.renderModalFooter()}
      </div>
    );
  }
}

AddPatientModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default withRouter(AddPatientModal);
