import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import moment from "moment";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import Breadcrumb from "react-bootstrap/lib/Breadcrumb";
import history from "lib/history";

import { confirmModal } from "common/modals";
import IntegrationConfiguration from "./components/integration-configuration";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
@observer
class DrChronoPage extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");
  }

  render() {
    const key = this.props.integrationStore.integrations.length;

    return (
      <Panel key={key} className="admin-panel integrations-settings">
        <Panel.Heading className="integrations-settings__overview">
          <Breadcrumb>
            <LinkContainer to="/admin/integrations">
              <Breadcrumb.Item>Integrations</Breadcrumb.Item>
            </LinkContainer>

            <Breadcrumb.Item active>drchrono</Breadcrumb.Item>
          </Breadcrumb>

          <div className="heading m-b-20">
            <div className="logo m-r-10">
              <img
                src="/images/drchrono-logo.png"
                className="img-responsive img-rounded"
                alt="Logo"
              />
            </div>
            <h1 className="title">drchrono</h1>

            <ButtonToolbar>
              <Link
                to="/admin/integrations/drchrono/new"
                className="btn btn-primary"
              >
                Add Configuration
              </Link>
            </ButtonToolbar>
          </div>
        </Panel.Heading>

        <Panel.Body>
          <Panel>
            <Panel.Heading className="configurations-panel__heading">
              <h3>Information</h3>
            </Panel.Heading>

            <Panel.Body className="configurations-panel__body">
              <p>
                drchrono EHR is an all-in-one EHR that seamlessly integrates
                patient scheduling, clinical workflow and medical billing. With
                our state-of-the art EHR system, you enter patient information
                only once and data gets automatically passed to clinical
                charting, e-prescription, lab orders, and medical billing
                minimizing multiple data entries and data entry errors.
              </p>
            </Panel.Body>
          </Panel>
        </Panel.Body>

        <Panel.Body>
          <Panel>
            <Panel.Heading className="configurations-panel__heading">
              <h3>Configurations</h3>
            </Panel.Heading>

            <Panel.Body className="configurations-panel__body">
              {this.props.integrationStore
                .forApp("drchrono")
                .map(integration => (
                  <IntegrationConfiguration
                    key={`integration-${integration.id}`}
                    id={integration.id}
                    integrationName="drchrono"
                    roomName={
                      this.props.groupsStore.getGroupById(integration.group_id)
                        .name
                    }
                    insertedAt={moment
                      .utc(integration.inserted_at)
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
