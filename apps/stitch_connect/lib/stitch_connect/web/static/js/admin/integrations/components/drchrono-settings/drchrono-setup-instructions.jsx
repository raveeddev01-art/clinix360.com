import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import omit from "lodash/omit";
import history from "lib/history";

import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import { Link } from "react-router-dom";

class DrChronoSetupInstructions extends Component {
  render() {
    return (
      <div className="integration-instructions">
        <p>Here are the steps necessary to add the drchrono integration.</p>

        <div className="integration-instructions__step row">
          <h3 className="integration-instructions__step__header col-md-2">
            Step 1
          </h3>
          <div className="integration-instructions__step__content col-md-10">
            <p>From your drchrono dashboard, click on Account > API.</p>
            <img src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-1.png" />
          </div>
        </div>

        <div className="integration-instructions__step row">
          <h3 className="integration-instructions__step__header col-md-2">
            Step 2
          </h3>
          <div className="integration-instructions__step__content col-md-10">
            <p>
              Set a name for your application and copy your Client ID and Client
              Secret values into Stitch (scroll down). Make sure your oauth
              redirect URI is set properly. Click on Save Changes.
            </p>
            <img src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-2.png" />
          </div>
        </div>

        <div className="integration-instructions__step row">
          <h3 className="integration-instructions__step__header col-md-2">
            Step 3
          </h3>
          <div className="integration-instructions__step__content col-md-10">
            <p>
              Once your save your drchrono application a section called Webhook
              will appear. Set a name for your webhook, and update the callback
              url using the value we generated for you below. (scroll down).
            </p>
            <p>Set your webhook secret token to:</p>
            <pre>stitch</pre>
            <p>
              Save your changes, and click Verify webhook. After a few moments
              it should switch to:
            </p>
            <pre>This webhook is verified</pre>
            <img src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-3.png" />
          </div>
        </div>

        <div className="integration-instructions__step row">
          <h3 className="integration-instructions__step__header col-md-2">
            Step 4
          </h3>
          <div className="integration-instructions__step__content col-md-10">
            <p>
              Mark your webhook as Active, and select which events you want to
              send to your Stitch workspace.
            </p>
            <img src="https://s3.amazonaws.com/stitch-content-public/integration-instructions/drchrono/step-4.png" />
          </div>
        </div>
      </div>
    );
  }
}

export default DrChronoSetupInstructions;
