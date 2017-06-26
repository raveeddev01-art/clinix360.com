import React, { Component } from "react";
import { Link } from "react-router-dom";

import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class LastName extends Component {
  render() {
    return (
      <div className="authentication-card text-center">
        <h2>Last Name</h2>

        <h5>Enter your <strong>last name</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" placeholder="Last Name" />
          </FormGroup>
          
          <HelpBlock>Your name will be shown next to your profile and messages.</HelpBlock>

          <Link to="/signup/phone-number" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}