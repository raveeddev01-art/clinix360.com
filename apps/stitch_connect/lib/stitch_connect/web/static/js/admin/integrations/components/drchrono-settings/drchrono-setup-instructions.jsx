import React, { Component } from "react";
import Col from "react-bootstrap/lib/Col";

class DrChronoSetupInstructions extends Component {
  render() {
    return (
      <div className="integration-instructions">
        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 1</h4>
            <p>From your drchrono dashboard, click on Account > API.</p>
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
              Click New Integration, and set your redirect URL. Then hit save.
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <img
                alt="drchrono setup step 2"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-2a.png"
              />
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
              Once your save your drchrono application a section called Webhook
              will appear. Set a name for your webhook, and update the callback
              url using the value we generated for you below. (scroll down).
            </p>
          </Col>
          <Col sm={7}>
            <div className="integration-instructions__step__content">
              <p>
                <b>Set your webhook secret token to:</b>
              </p>
              <pre>stitch</pre>
              <p>
                <b>
                  Save your changes, and click Verify webhook. After a few
                  moments it should switch to:
                </b>
              </p>
              <pre>This webhook is verified</pre>
              <img
                alt="drchrono setup step 4"
                src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-3.png"
              />
            </div>
          </Col>
        </div>

        <hr />

        <div className="integration-instructions__step row">
          <Col sm={5}>
            <h4 className="integrations-panel__heading">Step 5</h4>
            <p>
              Mark your webhook as Active, and select which events you want to
              send to your Stitch workspace.
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
      </div>
    );
  }
}

export default DrChronoSetupInstructions;
