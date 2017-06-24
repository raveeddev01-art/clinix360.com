import React, { Component } from "react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class TeamName extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Team Name</h2>

        <h5>Enter your <strong>team name</strong>.</h5>

        <form>
          <FormGroup controlId="formTeamName" bsSize="large">
            <FormControl type="text" placeholder="Ex. Care Clinic" />
            <FormControl.Feedback />
          </FormGroup>
          
          <HelpBlock>
            This is the name of your team.
            <br/>
            It will show up in menus and headings.
          </HelpBlock>

          <Button bsStyle="primary" block>Next</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}