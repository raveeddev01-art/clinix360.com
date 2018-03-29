import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";
import moment from "moment";

import Panel from "react-bootstrap/lib/Panel";

import IntegrationConfiguration from "./components/integration-configuration";

@inject("titleStore", "adminPanelStore", "integrationStore")
@observer
class DrChronoPage extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");
    this.props.integrationStore.loadIntegrations();
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

              <Link
                to="/admin/integrations/drchrono/new"
                className="btn btn-primary"
              >
                Add Configuration
              </Link>
            </Panel.Heading>

            <Panel.Body className="configurations-panel__body">
              {this.props.integrationStore.integrationConfigs.map(config => (
                <IntegrationConfiguration
                  id={config.id}
                  integrationName={config.integration_name}
                  roomName={config.group_name}
                  insertedAt={moment
                    .utc(config.inserted_at)
                    .local()
                    .format("LL")}
                />
              ))}
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
