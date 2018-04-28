import React, { Component } from "react";
import { inject } from "mobx-react";
import Col from "react-bootstrap/lib/Col";
import DrChronoRedirectUri from "./drchrono-redirect-uri";
import DrChronoWebhookUrl from "./drchrono-webhook-url";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
class DrChronoSetupInstructions extends Component {
  get selectedIntegration() {
    return this.props.integrationStore.selectedIntegration;
  }

  get redirectUri() {
    const token = this.selectedIntegration.webhook_token;
    return `${applicationScheme}${applicationHost}/_oauth/drchrono/${token}`;
  }

  get webhookUrl() {
    const token = this.selectedIntegration.webhook_token;
    return `${applicationScheme}${applicationHost}/webhook/drchrono/${token}`;
  }

  render() {
    return (
      <div className="integration-instructions">
        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 1</h4>
            <p>From your drchrono dashboard, click on Account then API.’</p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 1"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-1.png"
              />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 2</h4>
            <p>
              Click New Application. Set a name for your application. We
              recommend ‘Stitch’. Then, copy and paste the redirect URI below.
              Then click on Save Changes.’
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 2"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-2a.png"
              />
              <DrChronoRedirectUri />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 3</h4>
            <p>
              Set a name for your application and copy your Client ID and Client
              Secret values into Stitch (scroll down). Make sure your oauth
              redirect URI is set properly. Click on Save Changes.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 3"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-2.png"
              />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 4</h4>
            <p>
              Once your save your drchrono application, a section called Webhook
              will appear. Set a name for your webhook. We recommend 'Stitch'.
              Then, copy and paste the Webhook URL below. Set your webhook
              secret token to ‘stitch’. Then click on Save Changes. Then click
              'Verify'. After a few moments it should switch to 'This webhook is
              verified'. If it does not, refresh the page.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 4"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-3.png"
              />
            </div>
            <DrChronoWebhookUrl />
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 5</h4>
            <p>
              Check the box next to Active that says 'We will deliver event
              detail when this hook is triggered.'' Then select 'Send me
              everything' under the Events dropdown menu. Then click on Save
              Changes.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 5"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-4.png"
              />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 6</h4>
            <p>
              Click 'Show' next to Client ID and Client Secret. Copy the values
              and paste credentials below under 'Integration Settings'. Then
              click 'Authenticate' and authenticate your drchrono account.
              Finally, select which notifications you want to display and
              confirm your room. Then click 'Save Integration' to complete.
            </p>
          </Col>
        </div>
      </div>
    );
  }
}

export default DrChronoSetupInstructions;
