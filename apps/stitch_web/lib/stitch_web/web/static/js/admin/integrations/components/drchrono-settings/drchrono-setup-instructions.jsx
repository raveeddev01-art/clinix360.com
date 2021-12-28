import React, { Component } from "react";
import { inject } from "mobx-react";
import Col from "react-bootstrap/lib/Col";

import DrChronoWebhookUrl from "./drchrono-webhook-url";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
class DrChronoSetupInstructions extends Component {
  render() {
    return (
      <div className="integration-instructions">
        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 1</h4>
            <p>
              Now go to the section titled 'Webhook'. Set a name for your
              webhook. We recommend 'Stitch'. Then, copy and paste 'Your
              Callback URL' (on the right) into drchrono. Set your webhook
              secret token to InvoChat.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 4"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-4-new.png"
              />
            </div>
            <DrChronoWebhookUrl />
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 2</h4>
            <p>
              Check the box next to 'Active' that says 'We will deliver event
              detail when this hook is triggered.' Then select 'Send me
              everything' under the Events dropdown menu. Then click on 'Save
              Changes' in drchrono. Then click 'Verify'. After a few moments it
              should switch to 'This webhook is verified'. If it does not,
              refresh the drchrono page.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 5"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-5-new.png"
              />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 3</h4>
            <p>
              Finally, in InvoChat, select which notifications you want to display
              and confirm your room. Then click 'Save Integration' in InvoChat to
              complete. Note that when you are done, drcrhrono will continue to
              list the app as in 'Restricted Mode', which is expected for the
              integration.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 6"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-6.png"
              />
            </div>
          </Col>
        </div>
      </div>
    );
  }
}

export default DrChronoSetupInstructions;
