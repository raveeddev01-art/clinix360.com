import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { LinkContainer } from "react-router-bootstrap";
import history from "lib/history";

import Panel from "react-bootstrap/lib/Panel";
import Breadcrumb from "react-bootstrap/lib/Breadcrumb";
import Button from "react-bootstrap/lib/Button";

import DrChronoForm from "./drchrono-form";
import DrChronoSetupInstructions from "./drchrono-setup-instructions";
import { confirmModal } from "common/modals";

@inject("titleStore", "adminPanelStore", "integrationStore")
class DrChronoEditSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");

    this.props.integrationStore.setCurrentIntegration(
      parseInt(this.props.match.params.id, 10)
    );
  }

  removeIntegrationConfig = () => {
    confirmModal({
      title: "Remove Integration Configuration",
      message:
        "Are you sure you want to delete this integration configuration? This cannot be undone.",
      okLabel: "Remove"
    })
      .then(() => {
        this.props.integrationStore.removeConfig(
          parseInt(this.props.match.params.id)
        );
        history.push(`/admin/integrations/drchrono`);
      })
      .catch(() => {
        // do nothing
      });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    return (
      <Panel className="admin-panel integrations-settings">
        <Panel.Heading className="integrations-settings__overview">
          <Breadcrumb>
            <LinkContainer to="/admin/integrations">
              <Breadcrumb.Item>Integrations</Breadcrumb.Item>
            </LinkContainer>

            <LinkContainer to="/admin/integrations/drchrono">
              <Breadcrumb.Item>drchrono</Breadcrumb.Item>
            </LinkContainer>

            <Breadcrumb.Item active>Edit configuration</Breadcrumb.Item>
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

            <div className="actions">
              <button
                className="btn-link"
                onClick={this.removeIntegrationConfig}
              >
                Remove
              </button>
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
              <h3>Setup Instructions</h3>
            </Panel.Heading>

            <Panel.Body>
              <DrChronoSetupInstructions />
              <DrChronoForm
                integration={this.props.integrationStore.selectedIntegration}
              />
            </Panel.Body>
          </Panel>
        </Panel.Body>
      </Panel>
    );
  }
}

export default DrChronoEditSettings;
