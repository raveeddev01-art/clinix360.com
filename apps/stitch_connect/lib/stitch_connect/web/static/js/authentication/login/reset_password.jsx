import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class ResetPassword extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Reset Password</h2>

        <h5>Enter your <strong>email address</strong>.</h5>

        <form>
          <FormGroup controlId="formEmail" bsSize="large">
            <FormControl type="text" placeholder="Email" />
            <FormControl.Feedback />
          </FormGroup>

          <Button bsStyle="primary" block>Reset Password</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}