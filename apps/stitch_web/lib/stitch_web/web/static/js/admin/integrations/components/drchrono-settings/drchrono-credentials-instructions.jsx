import React, { Component } from "react";
import Col from "react-bootstrap/lib/Col";

import DrChronoRedirectUri from "./drchrono-redirect-uri";

class DrChronoCredentialsInstructions extends Component {
  render() {
    return (
      <div className="integration-instructions">
        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 1</h4>
            <p>
              From your drchrono dashboard, click on 'Account'. Then click
              'API'.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 1"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-1-new.png"
              />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 2</h4>
            <p>
              Click 'New Application' at the bottom of the page in drchrono.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 2"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-2-new.png"
              />
            </div>
          </Col>
        </div>

        <hr />
        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 3</h4>
            <p>
              Set a name for your application. We recommend ‘Clinix360’. Then,
              copy and paste the redirect URI (on the right). Then click on
              'Save Changes' in drchrono.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 3"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-3-new.png"
              />
              <DrChronoRedirectUri />
            </div>
          </Col>
        </div>

        <hr />
        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 4</h4>
            <p>
              In drchrono, click 'Show' next to Client ID and Client Secret.
              Copy these values and paste them into Clinix360 below (under
              'Integration Settings'). Then click 'Authenticate' and follow the
              steps in drchrono to authenticate your integration.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 1"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-1-credentials.png"
              />
            </div>
          </Col>
        </div>
      </div>
    );
  }
}

export default DrChronoCredentialsInstructions;
