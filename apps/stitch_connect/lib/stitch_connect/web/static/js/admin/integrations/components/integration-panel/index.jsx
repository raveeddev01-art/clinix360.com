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
    const { title, description, icon, slug } = this.props;

    return (
      <div className="panel-settings integrations-panel">
        <img
          src={icon}
          className="img-responsive img-rounded m-r-15"
          alt="Logo"
        />
        <div className="integrations-panel__content">
          <h3 className="m-b-0">{title}</h3>
          <HelpBlock>{description}</HelpBlock>
        </div>
        <LinkContainer to={`/admin/integrations/${slug}`}>
          <Button bsStyle="primary" className="action-edit btn-fancy">
            Manage
          </Button>
        </LinkContainer>
      </div>
    );
  }
}

IntegrationPanel.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired
};

IntegrationPanel.defaultProps = {
  title: "",
  description: "",
  slug: "",
  icon: ""
};

export default IntegrationPanel;
