import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class Username extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Username</h2>

        <h5>Enter a <strong>username</strong>.</h5>

        <form>
          <FormGroup controlId="formUsername" bsSize="large">
            <FormControl type="text" placeholder="username" />
            <FormControl.Feedback />
          </FormGroup>
          
          <HelpBlock>Your username is how other users will mention you in conversations. Pick something familiar.</HelpBlock>

          <Button bsStyle="primary" block>Next</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}