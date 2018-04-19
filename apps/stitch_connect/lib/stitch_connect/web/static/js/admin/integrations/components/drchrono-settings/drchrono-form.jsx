import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import omit from "lodash/omit";
import history from "lib/history";

import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import { Link } from "react-router-dom";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
class DrChronoForm extends Component {
  constructor(props) {
    super(props);

    const integration = this.props.integration;
    this.state = {
      id: integration.id,
      enabled: integration.enabled,
      authenticated: integration.authenticated,
      groupId: integration.group_id,
      webhookToken: integration.webhook_token,
      appointmentCreate: integration.settings.appointmentCreate || false,
      appointmentModify: integration.settings.appointmentModify || false,
      appointmentDelete: integration.settings.appointmentDelete || false,
      patientCreate: integration.settings.patientCreate || false,
      patientModify: integration.settings.patientModify || false,
      patientProblemCreate: integration.settings.patientProblemCreate || false,
      patientProblemModify: integration.settings.patientProblemModify || false,
      patientAllergyCreate: integration.settings.patientAllergyCreate || false,
      patientAllergyModify: integration.settings.patientAllergyModify || false,
      patientMedicationCreate:
        integration.settings.patientMedicationCreate || false,
      patientMedicationModify:
        integration.settings.patientMedicationModify || false,
      clientId: integration.credentials.clientId,
      clientSecret: integration.credentials.clientSecret
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

    this.setState(
      {
        [name]: value
      },
      () => {
        this._updateConfig();
      }
    );
  };

  _updateConfig = () => {
    const params = {
      id: this.props.integration.id,
      groupId: parseInt(this.state.groupId, 10),
      credentials: {
        clientId: this.state.clientId,
        clientSecret: this.state.clientSecret
      },
      settings: omit(this.state, ["groupId", "id", "clientId", "clientSecret"])
    };

    this.props.integrationStore.updateIntegration(params).then(() => {
      console.log("Updated on the fly properly");
    });
  };

  _handleFormSubmit = event => {
    event.preventDefault();
    this._updateConfig();
    history.push("/admin/integrations/drchrono");
  };

  _redirectUri = () => {
    return `${applicationScheme}${applicationHost}/_oauth/drchrono/${this.state
      .webhookToken}`;
  };

  _renderAuthenticateButton = () => {
    if (this.state.authenticated) {
      return <p>Authenticated</p>;
    }

    return (
      <Button
        style={{ marginTop: "20px" }}
        bsStyle="success"
        href={`https://drchrono.com/o/authorize?redirect_uri=${this._redirectUri()}&client_id=${this
          .state.clientId}&response_type=code`}
      >
        Authenticate
      </Button>
    );
  };

  render() {
    return (
      <Form horizontal onSubmit={this._handleFormSubmit}>
        <FormGroup>
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Credentials</h4>
            <p>Set your drchrono credentials here.</p>
          </Col>
          <Col sm={7}>
            <ControlLabel htmlFor="clientId">Client ID</ControlLabel>
            <FormControl
              name="clientId"
              id="clientId"
              onChange={this.onChange}
              type="text"
              defaultValue={this.state.clientId}
            />

            <ControlLabel htmlFor="clientSecret">Client Secret</ControlLabel>
            <FormControl
              name="clientSecret"
              id="clientSecret"
              onChange={this.onChange}
              type="text"
              defaultValue={this.state.clientSecret}
            />

            {this._renderAuthenticateButton()}

            <hr />

            <ControlLabel>Redirect URI</ControlLabel>
            <FormControl
              disabled
              name="redirectUri"
              id="redirectUri"
              type="text"
              value={this._redirectUri()}
            />

            <ControlLabel>Webhook URL</ControlLabel>
            <FormControl
              disabled
              name="webhookToken"
              id="webhookToken"
              type="text"
              value={`${applicationScheme}${applicationHost}/webhook/drchrono/${this
                .state.webhookToken}`}
            />
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
            Cancel
          </Link>
        </ButtonToolbar>
      </Form>
    );
  }
}

export default DrChronoForm;
