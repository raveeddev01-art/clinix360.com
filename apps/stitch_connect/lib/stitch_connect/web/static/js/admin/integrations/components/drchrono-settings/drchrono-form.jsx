import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import omit from "lodash/omit";
import history from "lib/history";

import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import { Link } from "react-router-dom";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
class DrChronoForm extends Component {
  constructor(props) {
    super(props);

    // This is a new empty integration config.
    if (this.props.new === true) {
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
        groupId: undefined
      };
    } else {
      const config = this.props.integrationStore.selectedConfig;
      this.state = {
        id: config.id,
        groupId: config.group_id,
        appointmentCreate: config.settings.appointmentCreate,
        appointmentModify: config.settings.appointmentModify,
        appointmentDelete: config.settings.appointmentDelete,
        patientCreate: config.settings.patientCreate,
        patientModify: config.settings.patientModify,
        patientProblemCreate: config.settings.patientProblemCreate,
        patientProblemModify: config.settings.patientProblemModify,
        patientAllergyCreate: config.settings.patientAllergyCreate,
        patientAllergyModify: config.settings.patientAllergyModify,
        patientMedicationCreate: config.settings.patientMedicationCreate,
        patientMedicationModify: config.settings.patientMedicationModify
      };
    }
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

  _createNewConfig = () => {
    const params = {
      groupId: this.state.groupId,
      integrationId: this.props.integrationStore.drChronoIntegration.id,
      settings: omit(this.state, "groupId")
    };

    this.props.integrationStore.createNewIntegration(params).then(() => {
      history.push(`/admin/integrations/drchrono`);
    });
  };

  _updateConfig = () => {
    const params = {
      id: this.state.id,
      groupId: this.state.groupId,
      integrationId: this.props.integrationStore.drChronoIntegration.id,
      settings: omit(this.state, ["groupId", "id"])
    };

    this.props.integrationStore.updateIntegration(params).then(() => {
      history.push(`/admin/integrations/drchrono`);
    });
  };

  _handleFormSubmit = event => {
    event.preventDefault();

    if (this.props.new === true) {
      this._createNewConfig();
    } else {
      this._updateConfig();
    }
  };

  render() {
    return (
      <Form horizontal onSubmit={this._handleFormSubmit}>
        <FormGroup>
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Authentication</h4>
          </Col>
          <Col sm={7}>
            <span className="integrations-panel__status">Authenticated</span>
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
          </Col>
        </FormGroup>

        <hr />

        <FormGroup>
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Post to Room</h4>
            <p>Notification that come in from drchrono will be posted here.</p>
          </Col>
          <Col sm={7}>
            <FormControl
              name="groupId"
              onChange={this.onChange}
              componentClass="select"
              defaultValue={this.state.groupId}
            >
              {this.props.groupsStore.regularGroups.map(group => (
                <option key={`option-group-${group.id}`} value={group.id}>
                  {this.props.groupsStore.getGroupName(group)}
                </option>
              ))}
            </FormControl>
          </Col>
        </FormGroup>

        <ButtonToolbar>
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="pull-right"
          >
            Save Integration
          </Button>

          <Link
            to="/admin/integrations/drchrono"
            type="button"
            className="pull-right btn btn-lg btn-default"
          >
            Go Back
          </Link>
        </ButtonToolbar>
      </Form>
    );
  }
}

export default DrChronoForm;
