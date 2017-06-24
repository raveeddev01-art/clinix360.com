import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class Email extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Email</h2>

        <h5>Enter your <strong>work email address</strong>.</h5>

        <form>
          <FormGroup controlId="formEmail" bsSize="large">
            <FormControl type="text" placeholder="Email" />
            <FormControl.Feedback />
          </FormGroup>

          <HelpBlock>We will send you a confirmation code to verify your email. If your team already has an account, ask your admin for an invitation.</HelpBlock>

          <Button bsStyle="primary" block>Next</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}