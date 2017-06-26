import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Email extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Email</h2>

        <h5>Enter your <strong>work email address</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" placeholder="Email" />
          </FormGroup>

          <HelpBlock>We will send you a confirmation code to verify your email. If your team already has an account, ask your admin for an invitation.</HelpBlock>

          <Link to="/signup/confirmation-code" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}