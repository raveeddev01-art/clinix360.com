import React, { Component } from "react";
import PropTypes from "prop-types";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

class IntegrationPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: false
    };
  }

  _enableIntegration = () => {
    this.setState({ authenticated: true });
  };

  render() {
    const { title, description } = this.props;

    return (
      <div className="panel-settings integrations-panel">
        {this.state.authenticated ? (
          <LinkContainer to="/admin/integrations/drchrono">
            <Button
              bsStyle="primary"
              className="action-edit btn-fancy pull-right"
            >
              Manage
            </Button>
          </LinkContainer>
        ) : (
          <Button
            bsStyle="primary"
            className="action-edit btn-fancy pull-right"
            onClick={this._enableIntegration}
          >
            Connect
          </Button>
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
