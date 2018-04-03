import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";
import moment from "moment";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";

import { confirmModal } from "common/modals";
import IntegrationConfiguration from "./components/integration-configuration";

@inject("titleStore", "adminPanelStore", "integrationStore")
@observer
class DrChronoPage extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");
    this.props.integrationStore.loadIntegrations();
  }

  _disableDrChrono = () => {
    confirmModal({
      title: "Disable drchrono integration for your team?",
      message:
        "Are you sure you want to disable your drchrono integration? You can always enable it later.",
      okLabel: "Disable"
    })
      .then(() => {
        const drchrono = this.props.integrationStore.integrations.find(
          i => i.name === "drchrono"
        );

        this.props.integrationStore.disable(drchrono.id);
      })
      .catch(() => {
        // do nothing
      });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  _enableDrChrono = () => {
    const drchrono = this.props.integrationStore.integrations.find(
      i => i.name === "drchrono"
    );

    this.props.integrationStore.enable(drchrono.id);
  };

  _renderEnableButton = enabled => {
    if (enabled) {
      return (
        <Button onClick={this._disableDrChrono} bsStyle="danger" to="#">
          Disable
        </Button>
      );
    }

    return (
      <Button onClick={this._enableDrChrono} bsStyle="success" to="#">
        Enable
      </Button>
    );
  };

  render() {
    if (this.props.integrationStore.loaded === false) {
      return null;
    }
    const drchrono = this.props.integrationStore.integrations.find(
      i => i.name === "drchrono"
    );

    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>drchrono</h1>
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
              {this._renderEnableButton(drchrono.enabled)}
            </Panel.Heading>

            <Panel.Body className="configurations-panel__body">
              <h4>Setup: Paste this into your drchrono api management page.</h4>
              <ul>
                <li>
                  Callback URL:{" "}
                  <strong
                  >{`${window.applicationScheme}${window.applicationHost}/webhooks/drchrono/${drchrono.webhook_token}`}</strong>
                </li>
                <li>
                  Secret Token: <strong>stitch</strong>
                </li>
                <li>
                  Active: <strong>checked</strong>
                </li>
              </ul>

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
