import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Button from "react-bootstrap/lib/Button";

@inject("titleStore", "adminPanelStore", "groupsStore")
class DrChronoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appointmentCreate: false,
      appointmentModify: false,
      appointmentDelete: false,
      patientCreate: false,
      patientModify: false,
      patientProblemCreate: false,
      patientProblemModify: false,
      patientAllergyCreate: false,
      patientAllergyModify: false,
      patientMedicationCreate: false,
      patientMedicationModify: false,
      clinicalNoteLock: false,
      clinicalNoteUnlock: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");
    console.log(this.props.groupsStore.normalGroups);
  }

  onChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  render() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Authentication</h4>
          </Col>
          <Col sm={7}>
            <span className="integrations-panel__status">
              Authenticated to drchrono as: <strong>username</strong>
            </span>
          </Col>
        </FormGroup>

        <hr />

        <FormGroup>
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Notifications</h4>
            <p>
              Which drchrono notification would you like to appear in Stitch?
            </p>
          </Col>

          <Col sm={7}>
            <h5 className="integrations-panel__subheading">Appointments</h5>
            <Checkbox
              name="appointmentCreate"
              checked={this.state.appointmentCreate}
              onChange={this.onChange}
            >
              Appointment created
            </Checkbox>

            <Checkbox
              name="appointmentModify"
              checked={this.state.appointmentModify}
              onChange={this.onChange}
            >
              Appointment modified
            </Checkbox>

            <Checkbox
              name="appointmentDelete"
              checked={this.state.appointmentDelete}
              onChange={this.onChange}
            >
              Appointment deleted
            </Checkbox>

            <h5 className="integrations-panel__subheading">Patients</h5>
            <Checkbox
              name="patientCreate"
              checked={this.state.patientCreate}
              onChange={this.onChange}
            >
              Patient created
            </Checkbox>

            <Checkbox
              name="patientModify"
              checked={this.state.patientModify}
              onChange={this.onChange}
            >
              Patient modified
            </Checkbox>

            <h5 className="integrations-panel__subheading">Problems</h5>
            <Checkbox
              name="patientProblemCreate"
              checked={this.state.patientProblemCreate}
              onChange={this.onChange}
            >
              Patient problem created
            </Checkbox>

            <Checkbox
              name="patientProblemModify"
              checked={this.state.patientProblemModify}
              onChange={this.onChange}
            >
              Patient problem modified
            </Checkbox>

            <h5 className="integrations-panel__subheading">Allergies</h5>
            <Checkbox
              name="patientAllergyCreate"
              checked={this.state.patientAllergyCreate}
              onChange={this.onChange}
            >
              Patient allergy created
            </Checkbox>

            <Checkbox
              name="patientAllergyModify"
              checked={this.state.patientAllergyModify}
              onChange={this.onChange}
            >
              Patient allergy modified
            </Checkbox>

            <h5 className="integrations-panel__subheading">Medications</h5>
            <Checkbox
              name="patientMedicationCreate"
              checked={this.state.patientMedicationCreate}
              onChange={this.onChange}
            >
              Patient medication created
            </Checkbox>

            <Checkbox
              name="patientMedicationModify"
              checked={this.state.patientMedicationModify}
              onChange={this.onChange}
            >
              Patient medication modified
            </Checkbox>

            <h5 className="integrations-panel__subheading">Clinical Notes</h5>
            <Checkbox
              name="clinicalNoteLock"
              checked={this.state.clinicalNoteLock}
              onChange={this.onChange}
            >
              Patient medication created
            </Checkbox>

            <Checkbox
              name="clinicalNoteUnlock"
              checked={this.state.clinicalNoteUnlock}
              onChange={this.onChange}
            >
              Patient medication modified
            </Checkbox>
          </Col>
        </FormGroup>

        <hr />

        <FormGroup>
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Post to Room</h4>
            <p>Notification that come in from drchrono will be posted here.</p>
          </Col>
          <Col sm={7}>
            <FormControl componentClass="select">
              {this.props.groupsStore.normalGroups.map(group => (
                <option key={`option-group-${group.id}`} value={group.id}>
                  {group.name}
                </option>
              ))}
            </FormControl>
          </Col>
        </FormGroup>

        <Button bsStyle="primary" bsSize="lg" className="pull-right">
          Save Integration
        </Button>
      </Form>
    );
  }
}

export default DrChronoForm;
