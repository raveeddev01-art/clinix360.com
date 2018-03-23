import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import find from "lodash/find";

@inject("integrationStore")
@observer
class IntegrationPanel extends Component {
  constructor(props) {
    super(props);
  }

  _enableIntegration = () => {
    this.setState({ authenticated: true });
  };

  render() {
    const { title, description } = this.props;
    const redirect_uri = `${applicationScheme}${applicationHost}/_oauth/drchrono`;

    return (
      <div className="panel-settings integrations-panel">
        {find(this.props.integrationStore.integrations, {
          name: "drchrono",
          enabled: true
        }) !== undefined ? (
          <LinkContainer to="/admin/integrations/drchrono">
            <Button
              bsStyle="primary"
              className="action-edit btn-fancy pull-right"
            >
              Manage
            </Button>
          </LinkContainer>
        ) : (
          <a
            href={`https://drchrono.com/o/authorize?redirect_uri=${redirect_uri}&client_id=${window.dr_chrono_client_id}&response_type=code`}
            bsStyle="primary"
            className="action-edit btn-fancy pull-right"
          >
            Connect
          </a>
        )}

        <h3>{title}</h3>
        <HelpBlock>{description}</HelpBlock>
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
