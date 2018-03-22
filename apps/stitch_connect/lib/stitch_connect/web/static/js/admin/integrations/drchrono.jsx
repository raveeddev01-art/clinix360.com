import React, { Component } from "react";
import { inject } from "mobx-react";

import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";

import IntegrationConfiguration from "./components/integration-configuration";

@inject("titleStore", "adminPanelStore")
class DrChronoPage extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");
  }

  render() {
    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>drChrono</h1>
        </Panel.Heading>

        <Panel.Body>
          <Panel>
            <Panel.Heading className="configurations-panel__heading">
              <h3>Configurations</h3>

              <Button bsStyle="primary">Add Configuration</Button>
            </Panel.Heading>

            <Panel.Body className="configurations-panel__body">
              <IntegrationConfiguration
                integrationName="drChrono"
                roomName="Emergency"
              />
              <IntegrationConfiguration
                integrationName="drChrono"
                roomName="General"
              />
              <IntegrationConfiguration
                integrationName="drChrono"
                roomName="ICU"
              />
              <IntegrationConfiguration
                integrationName="drChrono"
                roomName="Radiology"
              />
            </Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>
    );
  }
}

DrChronoPage.propTypes = {
  // onSuccess: PropTypes.func.isRequired,
  // onError: PropTypes.func.isRequired,
  // hideAlert: PropTypes.func.isRequired
};

export default DrChronoPage;
