import React, { Component } from "react";
import PropTypes from "prop-types";
import { LinkContainer } from "react-router-bootstrap";
import { inject } from "mobx-react";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import { Link } from "react-router-dom";

import { confirmModal } from "common/modals";

@inject("integrationStore")
class IntegrationConfiguration extends Component {
  removeIntegrationConfig = () => {
    confirmModal({
      title: "Remove Integration Configuration",
      message:
        "Are you sure you want to delete this integration configuration? This cannot be undone.",
      okLabel: "Remove"
    })
      .then(() => {
        return this.props.integrationStore.removeConfig(this.props.id);
      })
      .catch(() => {
        // do nothing
      });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  render() {
    const { id, integrationName, roomName, insertedAt } = this.props;

    return (
      <div className="configurations-panel__item">
        <div className="configurations-panel__item-logo m-r-10">
          <img
            src="/images/drchrono-logo.png"
            className="img-responsive img-rounded"
            alt="Logo"
          />
        </div>

        <div className="configurations-panel__item-description">
          <h4>
            Posted changes from <strong>{integrationName}</strong> to{" "}
            <strong>{roomName}</strong>
          </h4>
          <div className="text-muted">{insertedAt}</div>
        </div>

        <div className="integrations__room-panel-button">
          <ButtonToolbar>
            <Button onClick={this.removeIntegrationConfig}>
              <i className="fa fa-trash" />
            </Button>
            <LinkContainer to={`/admin/integrations/drchrono/${id}/edit`}>
              <Button>
                <i className="fa fa-pencil" />
              </Button>
            </LinkContainer>
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

IntegrationConfiguration.propTypes = {
  integrationName: PropTypes.string.isRequired,
  roomName: PropTypes.string.isRequired
};

IntegrationConfiguration.defaultProps = {
  integrationName: "",
  roomName: ""
};

export default IntegrationConfiguration;
