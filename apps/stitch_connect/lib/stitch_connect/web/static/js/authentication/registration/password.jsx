import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class Password extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Password</h2>

        <h5>Enter a <strong>password</strong>.</h5>

        <form>
          <FormGroup controlId="formTeamName" bsSize="large">
            <FormControl type="text" placeholder="Password" />
            <FormControl.Feedback />
          </FormGroup>
          
          <HelpBlock>
            Your password must contain:
            <ul className="list-unstyled">
              <li>At least 8 characters</li>
              <li>An uppercase letter</li>
              <li>A lowercase letter</li>
              <li>A number</li>
              <li>A special character (e.g.!$#)</li>
            </ul>
          </HelpBlock>

          <Button bsStyle="primary" block>Next</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}