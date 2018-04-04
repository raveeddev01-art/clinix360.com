import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

import Panel from "react-bootstrap/lib/Panel";
import DrChronoForm from "./drchrono-form";

@inject("titleStore", "adminPanelStore", "integrationStore")
class DrChronoEditSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");

    this.props.integrationStore.setCurrentIntegrationConfig(
      parseInt(this.props.match.params.id, 10)
    );
  }

  render() {
    return (
      <Panel className="admin-panel integrations-settings">
        <Panel.Heading className="integrations-settings__overview">
          <div className="heading m-b-20">
            <div className="logo m-r-10">
              <img
                src="/images/drchrono-logo.png"
                className="img-responsive img-rounded"
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
              <DrChronoForm
                config={this.props.integrationStore.selectedConfig}
              />
            </Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>
    );
  }
}

export default DrChronoEditSettings;
