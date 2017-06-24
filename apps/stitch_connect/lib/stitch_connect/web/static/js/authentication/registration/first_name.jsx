import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class FirstName extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>First Name</h2>

        <h5>Enter your <strong>first name</strong>.</h5>

        <form>
          <FormGroup controlId="formTeamName" bsSize="large">
            <FormControl type="text" placeholder="First Name" />
            <FormControl.Feedback />
          </FormGroup>
          
          <HelpBlock>Your name will be shown next to your profile and messages.</HelpBlock>

          <Button bsStyle="primary" block>Next</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}