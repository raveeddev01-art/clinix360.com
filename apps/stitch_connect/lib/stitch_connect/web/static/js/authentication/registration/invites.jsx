import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class Invites extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Send Invitations</h2>

        <h5>Enter <strong>invitations</strong> to email out.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" />
          </FormGroup>
          <FormGroup bsSize="large">
            <FormControl type="text" />
          </FormGroup>
          <FormGroup bsSize="large">
            <FormControl type="text" />
          </FormGroup>

          <button className="btn btn-block btn-default btn-invites">Add Invitation</button>
          
          <HelpBlock>Enter your team members' email addresses so they can join your team. You can also do this later after you set up your team.</HelpBlock>

          <Button bsStyle="primary" block>Next</Button>
          <Button block>Skip this step</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}