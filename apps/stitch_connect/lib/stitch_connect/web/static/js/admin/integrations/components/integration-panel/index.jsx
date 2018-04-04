import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@inject("integrationStore")
@observer
class IntegrationPanel extends Component {
  render() {
    const { title, description } = this.props;
    const redirect_uri = `${applicationScheme}${applicationHost}/_oauth/drchrono`;

    return (
      <div className="panel-settings integrations-panel">
        <img
          src="/images/drchrono-logo.png"
          className="img-responsive img-rounded m-r-15"
          alt="Logo"
        />

        <div className="integrations-panel__content">
          <h3 className="m-b-0">{title}</h3>
          <HelpBlock>{description}</HelpBlock>
        </div>

        {this.props.integrationStore.drChronoEnabled ? (
          <LinkContainer to="/admin/integrations/drchrono">
            <Button bsStyle="primary" className="action-edit btn-fancy">
              Manage
            </Button>
          </LinkContainer>
        ) : (
          <a
            href={`https://drchrono.com/o/authorize?redirect_uri=${redirect_uri}&client_id=${window.dr_chrono_client_id}&response_type=code`}
            target="_blank"
            className="action-edit btn-primary btn-fancy"
          >
            Connect
          </a>
        )}
      </div>
    );
  }
}

IntegrationPanel.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

IntegrationPanel.defaultProps = {
  title: "",
  description: ""
};

export default IntegrationPanel;
