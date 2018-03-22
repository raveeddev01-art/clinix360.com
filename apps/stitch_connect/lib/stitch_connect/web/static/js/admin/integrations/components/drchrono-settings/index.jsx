import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

import Panel from "react-bootstrap/lib/Panel";
import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Button from "react-bootstrap/lib/Button";

@inject("titleStore", "adminPanelStore")
class DrChronoSettings extends Component {
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
      <Panel className="admin-panel integrations-settings">
        <Panel.Heading className="integrations-settings__overview">
          <div className="heading m-b-20">
            <div className="logo m-r-10">
              <img
                src="https://3on3f11f1a042q4pv95221y1-wpengine.netdna-ssl.com/wp-content/uploads/2017/03/drchrono_icon.png"
                className="img-responsive"
                alt="Logo"
              />
            </div>
            <h1 className="title">drchrono</h1>
          </div>
          <h4 className="m-b-30">
            drchrono was the first EHR to build a native app for iPad and
            iPhone. drchrono was voted the #1 Electronic Health Record four
            years in a row by medical professionals in surveys conducted by
            Black Book Ratings. drchrono's growth led to it being added to Inc
            500's 2014 and 2015 list of the fastest growing companies in the
            United States. drchrono is Meaningful Use Stage 1 and 2 compliant.
            The platform has over 93,000 physicians signed up and 6 million
            patients under the care of the platform.
          </h4>
        </Panel.Heading>

        <Panel.Body>
          <Panel className="integrations-settings__panel">
            <Panel.Heading>
              <h3>Integration Settings</h3>
            </Panel.Heading>

            <Panel.Body>
              <Form horizontal>
                <FormGroup>
                  <Col sm={5}>
                    <h4 className="integrations-panel__heading">
                      Authentication
                    </h4>
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
                    <h4 className="integrations-panel__heading">
                      Notifications
                    </h4>
                    <p>
                      Which drchrono notification would you like to appear in
                      Stitch?
                    </p>
                  </Col>

                  <Col sm={7}>
                    <h5 className="integrations-panel__subheading">
                      Appointments
                    </h5>
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

                    <h5 className="integrations-panel__subheading">
                      Allergies
                    </h5>
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

                    <h5 className="integrations-panel__subheading">
                      Medications
                    </h5>
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

                    <h5 className="integrations-panel__subheading">
                      Clinical Notes
                    </h5>
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
                    <h4 className="integrations-panel__heading">
                      Post to Room
                    </h4>
                    <p>
                      Notification that come in from drchrono will be posted
                      here.
                    </p>
                  </Col>
                  <Col sm={7}>
                    <FormControl componentClass="select">
                      <option value="select">select (multiple)</option>
                      <option value="other">...</option>
                    </FormControl>
                  </Col>
                </FormGroup>

                <Button bsStyle="primary" bsSize="lg" className="pull-right">
                  Save Integration
                </Button>
              </Form>
            </Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>
    );
  }
}

// DrChronoSettings.propTypes = {
//   integrationName: PropTypes.string.isRequired,
//   roomName: PropTypes.string.isRequired
// };

// DrChronoSettings.defaultProps = {
//   integrationName: "",
//   roomName: ""
// };

export default DrChronoSettings;
