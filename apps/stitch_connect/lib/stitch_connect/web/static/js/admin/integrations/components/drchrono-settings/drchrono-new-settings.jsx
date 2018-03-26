import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

import Panel from "react-bootstrap/lib/Panel";
import DrChronoForm from "./drchrono-form";

@inject("titleStore", "adminPanelStore")
class DrChronoNewSettings extends Component {
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

            <div className="actions">
              <a href="#">Remove</a>
            </div>
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
              <DrChronoForm integrationSettings={{}} />
            </Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>
    );
  }
}

export default DrChronoNewSettings;
