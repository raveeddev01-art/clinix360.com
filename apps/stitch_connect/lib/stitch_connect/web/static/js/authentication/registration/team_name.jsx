import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class TeamName extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Team Name</h2>

        <h5>Enter your <strong>team name</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" placeholder="Ex. Care Clinic" />
          </FormGroup>
          
          <HelpBlock>
            This is the name of your team.
            <br/>
            It will show up in menus and headings.
          </HelpBlock>

          <Link to="/signup/first-name" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}