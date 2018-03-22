import React, { Component } from "react";
import PropTypes from "prop-types";
import { LinkContainer } from "react-router-bootstrap";

import Button from "react-bootstrap/lib/Button";

class IntegrationConfiguration extends Component {
  render() {
    const { integrationName, roomName } = this.props;

    return (
      <div className="configurations-panel__item">
        <div className="configurations-panel__item-logo m-r-10">
          <img
            src="https://3on3f11f1a042q4pv95221y1-wpengine.netdna-ssl.com/wp-content/uploads/2017/03/drchrono_icon.png"
            className="img-responsive"
            alt="Logo"
          />
        </div>

        <div className="configurations-panel__item-description">
          <h4>
            Posted changes from <strong>{integrationName}</strong> to{" "}
            <strong>{roomName}</strong>
          </h4>
          <div className="text-muted">
            <a href="#">John Appleseed</a> on Aug 27, 2018
          </div>
        </div>

        <div className="integrations__room-panel-button">
          <LinkContainer to="/admin/integrations/drchrono/edit">
            <Button>
              <i className="fa fa-pencil" />
            </Button>
          </LinkContainer>
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
