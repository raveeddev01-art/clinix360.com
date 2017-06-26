import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class Login extends Component {
  render() {
    return (
        <div className="authentication-card text-center">
          <h2>Sign In</h2>

          <h5>Enter your <strong>email address</strong> and <strong>password</strong>.</h5>

          <form>
            <FormGroup bsSize="large">
              <FormControl type="text" placeholder="Email" />
            </FormGroup>

            <FormGroup bsSize="large">
              <FormControl type="password" placeholder="Password" />
            </FormGroup>

            <Button bsStyle="primary" block>Sign In</Button>
            <Link to="/reset-password" className="btn btn-block btn-default">Reset Password</Link>
          </form>

          <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
        </div>
    );
  }
}